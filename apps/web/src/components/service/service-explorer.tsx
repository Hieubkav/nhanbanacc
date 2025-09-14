"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntityCardGrid } from "@/components/data/entity-card-grid";
import { slugify } from "@/lib/utils";
import { SearchIcon, Sparkles } from "lucide-react";

type SortKey = "title_asc" | "title_desc" | "updated_desc" | "updated_asc" | "sortOrder_asc";

export default function ServiceExplorer({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("sortOrder_asc");
  const [page, setPage] = useState(1);

  const sortMap = useMemo(() => {
    switch (sort) {
      case "title_asc":
        return { field: "title", direction: "asc" as const };
      case "title_desc":
        return { field: "title", direction: "desc" as const };
      case "updated_desc":
        return { field: "updatedAt", direction: "desc" as const };
      case "updated_asc":
        return { field: "updatedAt", direction: "asc" as const };
      default:
        return { field: "sortOrder", direction: "asc" as const };
    }
  }, [sort]);

  const list = useQuery(api.service_websites.list, {
    q: q.trim() || undefined,
    sort: sortMap as any,
    page,
    pageSize: 24,
  } as any);

  // Merge items across pages
  const [merged, setMerged] = useState<any[]>([]);
  useEffect(() => {
    setMerged([]);
    setPage(1);
  }, [q, sort]);
  useEffect(() => {
    if (!list?.items) return;
    setMerged((prev) => {
      const ids = new Set(prev.map((p: any) => String(p._id)));
      const next = [...prev];
      for (const it of list.items) if (!ids.has(String(it._id))) next.push(it);
      return next;
    });
  }, [list?.items]);

  // Fetch all service_website_images and images; join on client similar to products
  const swiList = useQuery(api.service_website_images.list, { pageSize: 1000 } as any);
  const imagesList = useQuery(api.images.list, { pageSize: 1000 } as any);

  const servicesWithDetails = useMemo(() => {
    if (!list?.items) return [];
    const items = merged.length ? merged : list.items;
    return items.map((svc: any) => {
      const links = (swiList?.items || []).filter((x: any) => String(x.serviceWebsiteId) === String(svc._id));
      const imgs = links
        .map((lnk: any) => {
          const img = (imagesList?.items || []).find((im: any) => String(im._id) === String(lnk.imageId));
          return img ? { ...img, sortOrder: lnk.sortOrder } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const imageIds = imgs.map((im: any) => String(im._id)).filter((id: string) => id && id !== "undefined");
      return { ...svc, images: imageIds.length ? imageIds : undefined };
    });
  }, [list, merged, swiList, imagesList]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <div className="mb-6 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Tìm dịch vụ thiết kế website"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
          />
        </div>
        <div>
          <select
            className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm shadow-sm focus:border-gold focus:ring-gold dark:bg-gray-800"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="sortOrder_asc">Nổi bật</option>
            <option value="updated_desc">Mới cập nhật</option>
            <option value="title_asc">Tiêu đề (A-Z)</option>
            <option value="title_desc">Tiêu đề (Z-A)</option>
            <option value="updated_asc">Cũ hơn</option>
          </select>
        </div>
      </div>

      <EntityCardGrid
        items={servicesWithDetails}
        getKey={(s: any) => String(s._id)}
        getTitle={(s: any) => s.title}
        getDescription={(s: any) => s.summary ?? s.description}
        getBadge={(s: any) => (s.isVisible ? undefined : "Ẩn")}
        // Dùng variants với 1 phần tử để tái sử dụng thẻ giá trong EntityCard
        getVariants={(s: any) => (s.isPriceVisible && s.price ? [{ price: s.price }] : undefined)}
        getImages={(s: any) => s.images}
        getExternalUrl={(s: any) => s.websiteUrl}
        onItemClick={(s: any) => {
          const base = s?.title ? slugify(String(s.title)) : undefined;
          const slugOrId = base ? `${base}-${String(s._id)}` : String(s._id);
          onOpenDetail(slugOrId);
        }}
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
