"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EntityCardGrid } from "@/components/data/entity-card-grid";
import { SearchIcon } from "lucide-react";

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

  // Lấy tất cả liên kết ảnh của bài viết và ghép vào dữ liệu thẻ
  const postImagesList = useQuery(api.post_images.list, { pageSize: 1000 } as any);

  const postsWithImages = useMemo(() => {
    const rows = (merged.length ? merged : list?.items) ?? [];
    return rows.map((post: any) => {
      // Ảnh ưu tiên: thumbnailId, sau đó đến các ảnh trong post_images theo sortOrder
      const links = (postImagesList?.items || [])
        .filter((pi: any) => String(pi.postId) === String(post._id))
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      const imageIds = [post.thumbnailId, ...links.map((l: any) => l.imageId)]
        .map((id: any) => (id ? String(id) : undefined))
        .filter((id: any) => id && id !== "undefined");
      const images = imageIds.length > 0 ? imageIds : undefined;
      return { ...post, images };
    });
  }, [merged, list?.items, postImagesList?.items]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Tìm theo tiêu đề bài viết" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-10 h-12 rounded-xl border-gray-300 focus:border-gold focus:ring-gold"
          />
        </div>
      </div>
      
      {/* Removed hardcoded content as per requirements */}
      
      <EntityCardGrid
        items={postsWithImages}
        getKey={(p: any) => String(p._id)}
        getTitle={(p: any) => p.title}
        getDescription={(p: any) => p.excerpt}
        // Ẩn badge "published" cho sạch sẽ
        getBadge={(p: any) => (p.status && String(p.status) !== "published" ? String(p.status) : undefined)}
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
