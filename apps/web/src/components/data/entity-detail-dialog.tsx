"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, CheckCircle2, Tag, CalendarClock } from "lucide-react";
import { StorageImage } from "@/components/shared/storage-image";

type Kind = "product" | "post";

function ProductDetail({ id }: { id: string }) {
  const data = useQuery(api.products.getById, { id: id as any });
  const pics = useQuery(api.product_images.listByProduct, {
    productId: id as any,
    sort: { field: "sortOrder", direction: "asc" },
    pageSize: 10,
  } as any);
  const variants = useQuery(api.product_variants.listByFK, {
    productId: id as any,
    sort: { field: "sortOrder", direction: "asc" },
    pageSize: 100,
  } as any);
  const reviews = useQuery(api.reviews.listByProduct, { productId: id as any, pageSize: 50 } as any);
  const category = useQuery(
    api.categories.getById,
    (data as any)?.categoryId ? ({ id: (data as any).categoryId } as any) : (undefined as any),
  );
  const title = useMemo(() => (data ? (data as any)?.name ?? "" : ""), [data]);
  const desc = useMemo(
    () => (data ? (data as any)?.shortDesc ?? (data as any)?.description ?? "" : ""),
    [data],
  );
  // Tính giá thấp nhất và % giảm
  const priceStats = useMemo(() => {
    const vs = variants?.items ?? [];
    if (!vs.length) return null;
    const minPrice = Math.min(...vs.map((v: any) => v.price));
    const minOriginal = Math.min(
      ...vs.map((v: any) => (v.originalPrice ? v.originalPrice : Infinity)),
    );
    const hasOriginal = isFinite(minOriginal) && minOriginal > minPrice;
    const percent = hasOriginal ? Math.round(((minOriginal - minPrice) / minOriginal) * 100) : 0;
    return { minPrice, minOriginal: hasOriginal ? minOriginal : undefined, percent };
  }, [variants?.items]);

  const avgRating = useMemo(() => {
    const rs = reviews?.items ?? [];
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s: number, r: any) => s + (r.rating || 0), 0);
    return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
  }, [reviews?.items]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
          {title || (data === undefined ? "Đang tải..." : "Không tìm thấy")}
          <Badge variant="secondary">Sản phẩm</Badge>
        </DialogTitle>
        {desc ? <DialogDescription>{desc}</DialogDescription> : null}
      </DialogHeader>

      {/* Hero image */}
      {pics?.items?.[0]?.imageId ? (
        <div className="relative mt-2 h-56 w-full overflow-hidden rounded-xl sm:h-64 md:h-72">
          <StorageImage imageId={String(pics.items[0].imageId)} alt={title} />
          {priceStats ? (
            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
              Từ {formatPrice(priceStats.minPrice)}
              {priceStats.minOriginal ? (
                <span className="ml-2 opacity-80 line-through">
                  {formatPrice(priceStats.minOriginal)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Gallery thumbnails */}
      {pics?.items?.length ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {pics.items.slice(0, 12).map((p: any) => (
            <div key={String(p._id)} className="relative h-20 w-full overflow-hidden rounded border">
              <StorageImage imageId={String(p.imageId)} alt={title} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {avgRating.count ? (
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {avgRating.avg} ({avgRating.count})
          </span>
        ) : null}
        {category ? (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-4 w-4" /> {category.name}
          </span>
        ) : null}
        {(data as any)?.status && String((data as any).status) !== "published" ? (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-4 w-4" /> {(data as any).status}
          </span>
        ) : null}
        {(data as any)?.updatedAt ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            {new Date((data as any).updatedAt).toLocaleDateString("vi-VN")}
          </span>
        ) : null}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="variants">Biến thể & giá</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-3">
          {Array.isArray((data as any)?.features) && (data as any)!.features!.length ? (
            <ul className="grid list-disc gap-1 pl-5 text-sm">
              {(data as any).features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có đặc điểm nổi bật.</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Button className="rounded-full">Liên hệ tư vấn</Button>
            {priceStats ? (
              <span className="text-sm text-muted-foreground">Giá từ {formatPrice(priceStats.minPrice)}</span>
            ) : null}
          </div>
        </TabsContent>
        <TabsContent value="variants" className="mt-3">
          {variants?.items?.length ? (
            <div className="grid gap-2">
              {variants.items.map((v: any) => (
                <div key={String(v._id)} className="flex items-start justify-between rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      {v.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mặc định
                        </span>
                      ) : null}
                    </div>
                    {v.note ? <div className="text-xs text-muted-foreground mt-0.5">{v.note}</div> : null}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      {formatPrice(v.price)}
                    </div>
                    {v.originalPrice && v.originalPrice > v.price ? (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(v.originalPrice)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có biến thể nào.</p>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="mt-3">
          {reviews?.items?.length ? (
            <div className="grid gap-3">
              {(reviews.items as any[]).slice(0, 3).map((r: any) => (
                <div key={String(r._id)} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (r.rating || 0) ? "fill-yellow-400" : ""}`} />
                    ))}
                  </div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có đánh giá.</p>
          )}
        </TabsContent>
        <TabsContent value="images" className="mt-3">
          {pics?.items?.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {pics.items.map((p: any) => (
                <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
                  <StorageImage imageId={String(p.imageId)} alt={title} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có hình ảnh.</p>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function PostDetail({ id }: { id: string }) {
  const data = useQuery(api.posts.getById, { id: id as any });
  const pics = useQuery(api.post_images.listByPost, {
    postId: id as any,
    sort: { field: "sortOrder", direction: "asc" },
    pageSize: 12,
  } as any);
  const title = useMemo(() => (data ? (data as any)?.title ?? "" : ""), [data]);
  const desc = useMemo(() => (data ? (data as any)?.excerpt ?? "" : ""), [data]);
  const heroId = (data as any)?.thumbnailId ? String((data as any).thumbnailId) : undefined;
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
          {title || (data === undefined ? "Đang tải..." : "Không tìm thấy")}
          <Badge variant="secondary">Bài viết</Badge>
        </DialogTitle>
        {desc ? <DialogDescription>{desc}</DialogDescription> : null}
      </DialogHeader>
      {heroId ? (
        <div className="relative mt-2 h-56 w-full overflow-hidden rounded-xl sm:h-64 md:h-72">
          <StorageImage imageId={heroId} alt={title} />
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {(data as any)?.status && String((data as any).status) !== "published" ? (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-4 w-4" /> {(data as any).status}
          </span>
        ) : null}
        {(data as any)?.updatedAt ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            {new Date((data as any).updatedAt).toLocaleDateString("vi-VN")}
          </span>
        ) : null}
      </div>

      <Tabs defaultValue="content" className="mt-4">
        <TabsList>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="meta">Thông tin</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-3">
          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {(data as any)?.content || "Chưa có nội dung."}
          </div>
        </TabsContent>
        <TabsContent value="images" className="mt-3">
          {pics?.items?.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {pics.items.map((p: any) => (
                <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
                  <StorageImage imageId={String(p.imageId)} alt={title} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có hình ảnh kèm theo.</p>
          )}
        </TabsContent>
        <TabsContent value="meta" className="mt-3 text-sm text-muted-foreground">
          <div>Cập nhật: {new Date((data as any)?.updatedAt ?? (data as any)?.createdAt ?? Date.now()).toLocaleString("vi-VN")}</div>
          {(data as any)?.slug ? <div>Slug: {(data as any).slug}</div> : null}
          {(data as any)?.status && String((data as any).status) !== "published" ? (
            <div>Trạng thái: {(data as any).status}</div>
          ) : null}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function EntityDetailDialog({
  open,
  onOpenChange,
  kind,
  id,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kind: Kind;
  id: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={kind === "post" ? "max-w-3xl" : "max-w-3xl"}>
        {kind === "product" ? <ProductDetail id={id} /> : <PostDetail id={id} />}
      </DialogContent>
    </Dialog>
  );
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
