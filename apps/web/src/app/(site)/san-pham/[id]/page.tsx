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
import { CheckCircle2, Star } from "lucide-react";

export default function SanPhamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const data = useQuery(api.products.getById, { id: id as any });
  const pics = useQuery(api.product_images.listByProduct, { productId: id as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);
  const variants = useQuery(api.product_variants.listByFK, { productId: id as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 100 } as any);
  const reviews = useQuery(api.reviews.listByProduct, { productId: id as any, pageSize: 50 } as any);
  const settings = useQuery(api.settings.getOne);

  const title = (data as any)?.name ?? "Đang tải...";
  const summary = (data as any)?.shortDesc ?? (data as any)?.description ?? "";
  const heroId = pics?.items?.[0]?.imageId ? String(pics.items[0].imageId) : undefined;
  const minPrice = variants?.items?.length ? Math.min(...(variants.items as any[]).map((v: any) => v.price)) : undefined;
  const minOriginal = variants?.items?.length ? Math.min(...(variants.items as any[]).map((v: any) => (v.originalPrice || Infinity))) : undefined;
  const hasOriginal = !!(minPrice && minOriginal && isFinite(minOriginal) && minOriginal > minPrice);
  const rating = (() => {
    const rs = reviews?.items ?? [];
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s: number, r: any) => s + (r.rating || 0), 0);
    return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
  })();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/san-pham" className="hover:underline">Sản phẩm</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            {heroId ? (
              <StorageImage imageId={heroId} alt={title} fit="contain" className="h-[360px] w-full bg-white dark:bg-gray-900" />
            ) : (
              <div className="h-[360px] w-full bg-muted" />
            )}
          </div>
          {pics?.items?.length ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {pics.items.slice(0, 12).map((p: any) => (
                <div key={String(p._id)} className="relative h-20 w-full overflow-hidden rounded-xl border">
                  <StorageImage imageId={String(p.imageId)} alt={title} fit="contain" className="bg-white dark:bg-gray-900" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
            {(data as any)?.status && String((data as any).status) !== "published" ? (
              <Badge className="shrink-0">{String((data as any).status)}</Badge>
            ) : null}
          </div>
          {summary ? <p className="text-muted-foreground">{summary}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            {minPrice !== undefined ? (
              <div className="text-2xl font-bold text-primary">Từ {formatPrice(minPrice)}</div>
            ) : (
              <div className="text-2xl font-bold">Liên hệ</div>
            )}
            {hasOriginal ? (
              <div className="text-sm text-muted-foreground line-through">{formatPrice(minOriginal as number)}</div>
            ) : null}
            {rating.count ? (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {rating.avg} ({rating.count})
              </span>
            ) : null}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="rounded-xl">Mua ngay</Button>
            {settings?.socialFacebook ? (
              <Button asChild variant="secondary" size="lg" className="rounded-xl">
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">Liên hệ Facebook</a>
              </Button>
            ) : null}
          </div>

          <Separator className="my-2" />

          {/* Variants */}
          <div className="grid gap-2">
            <h2 className="text-base font-semibold">Tuỳ chọn</h2>
            {(variants?.items ?? []).map((v: any) => (
              <div key={String(v._id)} className="flex items-start justify-between rounded-xl border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{v.name}</span>
                    {v.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mặc định
                      </span>
                    ) : null}
                  </div>
                  {v.note ? <div className="mt-0.5 text-xs text-muted-foreground">{v.note}</div> : null}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">{formatPrice(v.price)}</div>
                  {v.originalPrice && v.originalPrice > v.price ? (
                    <div className="text-xs text-muted-foreground line-through">{formatPrice(v.originalPrice)}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Description */}
      <div className="mt-10">
        <h2 className="text-base font-semibold">Mô tả</h2>
        <div className="prose prose-sm max-w-none dark:prose-invert mt-3">
          {(data as any)?.description ? (
            <div dangerouslySetInnerHTML={{ __html: String((data as any).description) }} />
          ) : (
            <p className="text-muted-foreground">Chưa có mô tả.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
