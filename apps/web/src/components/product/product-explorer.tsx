"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntityCardGrid } from "@/components/data/entity-card-grid";
import { SearchIcon, FilterIcon } from "lucide-react";

type SortKey = "name_asc" | "name_desc" | "updated_desc" | "updated_asc" | "sortOrder_asc";

export default function ProductExplorer({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortKey>("sortOrder_asc");
  const [page, setPage] = useState(1);

  const categories = useQuery(api.categories.list, { sort: { field: "sortOrder", direction: "asc" }, pageSize: 100 } as any);

  const sortMap = useMemo(() => {
    switch (sort) {
      case "name_asc":
        return { field: "name", direction: "asc" as const };
      case "name_desc":
        return { field: "name", direction: "desc" as const };
      case "updated_desc":
        return { field: "updatedAt", direction: "desc" as const };
      case "updated_asc":
        return { field: "updatedAt", direction: "asc" as const };
      default:
        return { field: "sortOrder", direction: "asc" as const };
    }
  }, [sort]);

  const filters = useMemo(() => {
    const arr: any[] = [];
    if (categoryId !== "all") arr.push({ field: "categoryId", value: categoryId });
    return arr;
  }, [categoryId]);

  const list = useQuery(api.products.list, {
    q: q.trim() || undefined,
    filters,
    sort: sortMap as any,
    page,
    pageSize: 24,
  } as any);

  // Merge items across pages if needed (simple: reset when q/filter/sort changed)
  const [merged, setMerged] = useState<any[]>([]);
  useEffect(() => {
    setMerged([]);
    setPage(1);
  }, [q, categoryId, sort]);
  useEffect(() => {
    if (!list?.items) return;
    setMerged((prev) => {
      // avoid duplicates
      const ids = new Set(prev.map((p: any) => String(p._id)));
      const next = [...prev];
      for (const it of list.items) if (!ids.has(String(it._id))) next.push(it);
      return next;
    });
  }, [list?.items]);

  // Lấy danh sách biến thể theo các productIds hiện có để tính giá "Từ x"
  const productIds = useMemo(() => {
    const arr = (merged.length ? merged : list?.items) ?? [];
    return arr.map((p: any) => p._id).filter(Boolean);
  }, [merged, list?.items]);

  const variantsList = useQuery(
    api.product_variants.listByProductIds,
    // Khi chưa có ids thì truyền mảng rỗng để hook ổn định
    { productIds: (productIds as any) ?? [], pageSize: 1000 } as any
  );

  const variantsByProductId = useMemo(() => {
    const map: Record<string, Array<{ price: number; originalPrice?: number }>> = {};
    const items = variantsList?.items ?? [];
    for (const v of items as any[]) {
      const key = String(v.productId);
      if (!map[key]) map[key] = [];
      map[key].push({ price: v.price, originalPrice: v.originalPrice });
    }
    return map;
  }, [variantsList?.items]);

  // Fetch all product images and filter on client side
  const productImagesList = useQuery(api.product_images.list, { pageSize: 1000 } as any);
  
  // Fetch all images and filter on client side
  const imagesList = useQuery(api.images.list, { pageSize: 1000 } as any);

  // Combine product data with images
  const productsWithDetails = useMemo(() => {
    if (!list?.items) return [];
    
    const productIds = (merged.length ? merged : list.items).map((p: any) => String(p._id));
    
    return (merged.length ? merged : list.items).map((product: any) => {
      // Get images for this product
      const productImageLinks = (productImagesList?.items || []).filter(
        (pi: any) => String(pi.productId) === String(product._id)
      );
      
      // Get image details and sort by sortOrder
      const productImages = productImageLinks
        .map((pi: any) => {
          const image = (imagesList?.items || []).find(
            (img: any) => String(img._id) === String(pi.imageId)
          );
          return image ? { ...image, sortOrder: pi.sortOrder } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      
      // Extract imageIds or use undefined if no images
      const imageIds = productImages
        .map((img: any) => String(img?._id))
        .filter((id: string) => id && id !== "undefined");
      const images = imageIds.length > 0 ? imageIds : undefined;
      
      return {
        ...product,
        images,
      };
    });
  }, [list, merged, productImagesList, imagesList]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <div className="mb-6 grid gap-4 sm:grid-cols-1 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Tìm theo tên sản phẩm" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-10 h-12 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
          />
        </div>
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <select 
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-gold focus:ring-gold dark:bg-gray-800" 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value as any)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories?.items?.map((c: any) => (
              <option key={String(c._id)} value={String(c._id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select 
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm shadow-sm focus:border-gold focus:ring-gold dark:bg-gray-800" 
            value={sort} 
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="sortOrder_asc">Nổi bật</option>
            <option value="updated_desc">Mới cập nhật</option>
            <option value="name_asc">Tên (A→Z)</option>
            <option value="name_desc">Tên (Z→A)</option>
            <option value="updated_asc">Cũ hơn</option>
          </select>
        </div>
      </div>

      <EntityCardGrid
        items={productsWithDetails}
        getKey={(p: any) => String(p._id)}
        getTitle={(p: any) => p.name}
        getDescription={(p: any) => p.shortDesc ?? p.description}
        // Ẩn badge khi trạng thái là "published" để không hiện chữ này ở danh sách nổi bật
        getBadge={(p: any) => (p.status && String(p.status) !== "published" ? String(p.status) : undefined)}
        // Cung cấp variants để thẻ hiển thị giá dạng "Từ x VND"
        getVariants={(p: any) => variantsByProductId[String(p._id)]}
        getImages={(p: any) => p.images}
        onItemClick={(p: any) => onOpenDetail(String(p._id))}
      />

      <div className="mt-8 flex justify-center">
        {list?.hasMore ? (
          <Button 
            variant="outline" 
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full px-8 py-3 border-2 border-gold text-gold hover:bg-gold/10 dark:border-gold dark:text-gold dark:hover:bg-gold/20"
          >
            Tải thêm
          </Button>
        ) : null}
      </div>
    </section>
  );
}
