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

  return (
    <section className="rounded-2xl border bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
      <div className="mb-6 grid gap-3 sm:grid-cols-1 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Tìm theo tên sản phẩm" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-10"
          />
        </div>
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <select 
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm shadow-sm dark:bg-gray-800" 
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
            className="w-full rounded-lg border bg-white py-2 px-3 text-sm shadow-sm dark:bg-gray-800" 
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
        items={merged.length ? merged : list?.items}
        getKey={(p: any) => String(p._id)}
        getTitle={(p: any) => p.name}
        getDescription={(p: any) => p.shortDesc ?? p.description}
        getBadge={(p: any) => (p.status ? String(p.status) : undefined)}
        onItemClick={(p: any) => onOpenDetail(String(p._id))}
      />

      <div className="mt-6 flex justify-center">
        {list?.hasMore ? (
          <Button 
            variant="outline" 
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full px-6"
          >
            Tải thêm
          </Button>
        ) : null}
      </div>
    </section>
  );
}

