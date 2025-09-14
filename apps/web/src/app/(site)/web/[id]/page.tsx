"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon, Facebook } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StorageImage } from "@/components/shared/storage-image";
import SafeHtml from "@/components/shared/safe-html";
import { Skeleton } from "@/components/ui/skeleton";

function extractConvexId(slugOrId: string): string | undefined {
  const parts = slugOrId.split("-");
  const maybe = parts[parts.length - 1];
  if (maybe && maybe.length >= 8) return maybe;
  return slugOrId || undefined;
}

export default function ServiceWebsiteDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const rawId = Array.isArray(routeParams?.id) ? routeParams?.id?.[0] : routeParams?.id;
  const convexId = useMemo(() => (rawId ? extractConvexId(String(rawId)) : undefined), [rawId]);

  const detail = useQuery(api.service_websites.getById as any, convexId ? ({ id: convexId } as any) : (undefined as any));
  const links = useQuery(
    api.service_website_images.listByServiceWebsite as any,
    detail?._id ? ({ serviceWebsiteId: detail._id, pageSize: 1000 } as any) : (undefined as any)
  );
  const images = useQuery(api.images.list as any, { pageSize: 1000 } as any);
  const settings = useQuery(api.settings.getOne as any, {} as any);

  const zaloLink = useMemo(() => {
    const s: any = settings || {};
    const direct = s?.socialZalo || s?.zalo || s?.contactZalo || s?.zaloUrl;
    if (direct) return String(direct);
    const phone = s?.zaloPhone || s?.contactPhone || s?.phone || s?.hotline;
    if (typeof phone === "string" && phone.trim()) {
      const digits = String(phone).replace(/[^0-9]/g, "");
      if (digits) return `https://zalo.me/${digits}`;
    }
    return undefined;
  }, [settings]);

  const heroImages = useMemo(() => {
    if (!detail?._id) return [] as string[];
    const joined = (links?.items || [])
      .map((lnk: any) => {
        const img = (images?.items || []).find((im: any) => String(im._id) === String(lnk.imageId));
        return img ? { id: String(img._id), sortOrder: lnk.sortOrder ?? 0 } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    return joined.map((x: any) => x.id);
  }, [detail?._id, links?.items, images?.items]);

  const title = detail?.title;
  const summary = detail?.summary;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* HERO */}
      <section className="mb-6">
        {!detail ? (
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/70">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
              {summary ? <p className="text-muted-foreground">{summary}</p> : null}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {detail.clientName ? (
                  <Badge variant="secondary">Khách hàng: {detail.clientName}</Badge>
                ) : null}
                {detail.isPriceVisible && typeof detail.price === "number" ? (
                  <Badge className="bg-yellow-500 text-white">Giá tham khảo: {formatPrice(detail.price)}</Badge>
                ) : null}
                {detail.isVisible === false ? (
                  <Badge variant="outline">Ẩn</Badge>
                ) : null}
                {detail.websiteUrl ? (
                  <Link href={detail.websiteUrl} target="_blank" className="inline-flex items-center gap-2 text-gold hover:underline">
                    <LinkIcon size={16} /> Website tham chiếu
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* NỘI DUNG THỰC TẾ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Hình ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              {!detail ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                  ))}
                </div>
              ) : heroImages.length ? (
                <div className="space-y-3">
                  {/* Ảnh chính */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <StorageImage imageId={heroImages[0]} alt={title} />
                  </div>
                  {/* Thumbnail */}
                  {heroImages.length > 1 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                      {heroImages.slice(1).map((id: string) => (
                        <div key={id} className="relative aspect-square overflow-hidden rounded-md">
                          <StorageImage imageId={id} alt={title} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Chưa có hình ảnh</div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Chi tiết mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              {!detail ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : detail.description ? (
                <SafeHtml html={detail.description} />
              ) : summary ? (
                <p className="text-sm text-muted-foreground">{summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có mô tả</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Khách hàng</span>
                <span className="text-muted-foreground">{detail?.clientName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ngân sách</span>
                <span className="font-medium">
                  {detail?.isPriceVisible && typeof detail?.price === "number" ? formatPrice(detail.price) : "Liên hệ"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trạng thái</span>
                <span className="text-muted-foreground">{detail?.isVisible === false ? "Ẩn" : "Hiển thị"}</span>
              </div>
              {detail?.websiteUrl ? (
                <div className="flex items-center justify-between">
                  <span>Website</span>
                  <Link href={detail.websiteUrl} target="_blank" className="text-gold hover:underline">Mở</Link>
                </div>
              ) : null}
              <Separator className="my-2" />
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2">
                <Button asChild size="lg" className="w-full min-w-0" disabled={!zaloLink}>
                  <a href={zaloLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Tư vấn Zalo">
                    <ZaloIcon className="mr-2 h-5 w-5" /> Tư vấn Zalo
                  </a>
                </Button>
                {settings?.socialFacebook && (
                  <Button asChild variant="outline" size="lg" className="w-full min-w-0">
                    <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Tư vấn Facebook" className="min-w-0">
                      <Facebook className="mr-2 h-5 w-5" /> Tư vấn FB
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const ZaloIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4h12l-12 16h12" />
  </svg>
);
