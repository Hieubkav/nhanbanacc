"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StorageImage } from "@/components/shared/storage-image";

export default function WebDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const data = useQuery(api.service_websites.getById, { id: id as any });
  const pics = useQuery(api.service_website_images.listByServiceWebsite, { serviceWebsiteId: id as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);

  const title = (data as any)?.title ?? "Đang tải...";
  const summary = (data as any)?.summary ?? "";
  const description = (data as any)?.description ?? "";
  const firstImageId = pics?.items?.[0]?.imageId ? String(pics.items[0].imageId) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/web" className="hover:underline">Làm web</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            {firstImageId ? (
              <StorageImage imageId={firstImageId} alt={title} className="h-[360px] w-full" />
            ) : (
              <div className="h-[360px] w-full bg-muted" />
            )}
          </div>
          {pics?.items?.length ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {pics.items.slice(0, 12).map((p: any) => (
                <div key={String(p._id)} className="relative h-20 w-full overflow-hidden rounded-xl border">
                  <StorageImage imageId={String(p.imageId)} alt={title} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
            <Badge variant="secondary">Dịch vụ web</Badge>
          </div>
          {summary ? <p className="text-muted-foreground">{summary}</p> : null}
          <div className="flex flex-wrap gap-2">
            {(data as any)?.websiteUrl ? (
              <Button asChild size="lg" className="rounded-xl">
                <a href={(data as any).websiteUrl} target="_blank" rel="noopener noreferrer">Xem website mẫu</a>
              </Button>
            ) : null}
            <Button variant="secondary" size="lg" className="rounded-xl">Liên hệ tư vấn</Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-10">
        <h2 className="text-base font-semibold">Mô tả</h2>
        <div className="prose prose-sm max-w-none dark:prose-invert mt-3">
          {description ? (
            <div dangerouslySetInnerHTML={{ __html: String(description) }} />
          ) : (
            <p className="text-muted-foreground">Chưa có mô tả.</p>
          )}
        </div>
      </div>

      <Separator className="my-10" />
    </div>
  );
}
