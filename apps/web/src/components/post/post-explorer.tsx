"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntityCardGrid } from "@/components/data/entity-card-grid";

export default function PostExplorer({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const list = useQuery(api.posts.list, { q: q.trim() || undefined, sort: { field: "updatedAt", direction: "desc" }, page, pageSize: 12 } as any);

  const [merged, setMerged] = useState<any[]>([]);
  useEffect(() => {
    setMerged([]);
    setPage(1);
  }, [q]);
  useEffect(() => {
    if (!list?.items) return;
    setMerged((prev) => {
      const ids = new Set(prev.map((p: any) => String(p._id)));
      const next = [...prev];
      for (const it of list.items) if (!ids.has(String(it._id))) next.push(it);
      return next;
    });
  }, [list?.items]);

  return (
    <section className="rounded-xl border p-4">
      <div className="mb-3">
        <Input placeholder="Tìm theo tiêu đề bài viết" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <EntityCardGrid
        items={merged.length ? merged : list?.items}
        getKey={(p: any) => String(p._id)}
        getTitle={(p: any) => p.title}
        getDescription={(p: any) => p.excerpt}
        getBadge={(p: any) => (p.status ? String(p.status) : undefined)}
        onItemClick={(p: any) => onOpenDetail(String(p._id))}
      />
      <div className="mt-4 flex justify-center">
        {list?.hasMore ? (
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Tải thêm
          </Button>
        ) : null}
      </div>
    </section>
  );
}

