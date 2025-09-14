"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StorageImage } from "@/components/shared/storage-image";

export default function BaiVietDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useQuery(api.posts.getById, { id: id as any });
  const pics = useQuery(api.post_images.listByPost, { postId: id as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);

  const title = (data as any)?.title ?? "Đang tải...";
  const excerpt = (data as any)?.excerpt ?? "";
  const heroId = (data as any)?.thumbnailId ? String((data as any).thumbnailId) : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/bai-viet" className="hover:underline">Bài viết</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {(data as any)?.updatedAt ? (
            <span>
              {new Date((data as any).updatedAt).toLocaleDateString("vi-VN")}
            </span>
          ) : null}
          {(data as any)?.status && String((data as any).status) !== "published" ? (
            <Badge variant="secondary">{String((data as any).status)}</Badge>
          ) : null}
        </div>

        {heroId ? (
          <div className="relative mt-5 overflow-hidden rounded-2xl border">
            <StorageImage imageId={heroId} alt={title} className="h-[300px] w-full object-cover" />
          </div>
        ) : null}

        {excerpt ? <p className="mt-4 text-muted-foreground">{excerpt}</p> : null}

        <Separator className="my-6" />

        <article className="prose prose-sm max-w-none dark:prose-invert">
          {(data as any)?.content ? (
            <div dangerouslySetInnerHTML={{ __html: String((data as any).content) }} />
          ) : (
            <p className="text-muted-foreground">Chưa có nội dung.</p>
          )}
        </article>

        {pics?.items?.length ? (
          <>
            <Separator className="my-6" />
            <div>
              <h2 className="text-base font-semibold">Hình ảnh kèm theo</h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {pics.items.map((p: any) => (
                  <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
                    <StorageImage imageId={String(p.imageId)} alt={title} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
