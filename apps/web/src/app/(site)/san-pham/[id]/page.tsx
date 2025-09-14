"use client";

import { use, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import type { Id } from "@nhanbanacc/backend/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StorageImage } from "@/components/shared/storage-image";
import { Star, CheckCircle2, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SafeHtml from "@/components/shared/safe-html";

// Helper to format price
function formatPrice(n: number) {
  if (isNaN(n)) return "";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

// Main Component
export default function SanPhamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const _raw = String(id);
  const _extracted = _raw.includes("-") ? (_raw.split("-").pop() as string) : _raw;
  const productId = _extracted as Id<"products">;

  // Data fetching
  const data = useQuery(api.products.getById, { id: productId });
  const pics = useQuery(api.product_images.listByProduct, { productId, sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 });
  const variants = useQuery(api.product_variants.listByFK, { productId, sort: { field: "sortOrder", direction: "asc" }, pageSize: 100 });
  const reviews = useQuery(api.reviews.listByProduct, { productId, pageSize: 50 });
  const settings = useQuery(api.settings.getOne);
  // Build Zalo link from settings for reuse
  const zaloLink = useMemo(() => {
    const s: any = settings || {};
    const direct = s?.socialZalo || s?.zalo || s?.contactZalo || s?.zaloUrl;
    if (direct) return String(direct);
    const phone = s?.zaloPhone || s?.contactPhone || s?.phone || s?.hotline;
    if (phone) {
      const digits = String(phone).replace(/[^0-9]/g, "");
      if (digits) return `https://zalo.me/${digits}`;
    }
    return undefined;
  }, [settings]);

  // Memoized values for performance
  const productTitle = data?.name ?? "Đang tải...";
  const heroImageId = pics?.items?.[0]?.imageId;

  const rating = useMemo(() => {
    const rs = reviews?.items ?? [];
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s, r) => s + (r.rating || 0), 0);
    return { avg: Math.round((sum / rs.length) * 10) / 10, count: rs.length };
  }, [reviews]);

  // State for interactive elements
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(() => 
    variants?.items?.find(v => v.isDefault)?._id || variants?.items?.[0]?._id
  );

  // Set default selected image when pictures load
  useEffect(() => {
    if (heroImageId && !selectedImageId) {
      setSelectedImageId(String(heroImageId));
    }
  }, [heroImageId, selectedImageId]);

  // Set default variant when variants load
  useEffect(() => {
    if (!selectedVariantId && variants?.items?.length) {
      const def = variants.items.find((v: any) => v.isDefault)?._id || variants.items[0]._id;
      if (def) setSelectedVariantId(String(def));
    }
  }, [variants?.items, selectedVariantId]);
  
  // Memoize selected variant and price
  const selectedVariant = useMemo(() => 
    variants?.items.find(v => v._id === selectedVariantId)
  , [variants, selectedVariantId]);

  const displayPrice = selectedVariant?.price;
  const displayOriginalPrice = selectedVariant?.originalPrice;

  if (data === undefined) {
    return <ProductDetailSkeleton />;
  }

  if (data === null) {
    return <div className="text-center py-12">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb title={productTitle} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ImageGallery 
          productTitle={productTitle}
          images={pics?.items} 
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />
        
        <ProductInfo
          data={data}
          rating={rating}
          variants={variants?.items}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
          displayPrice={displayPrice}
          displayOriginalPrice={displayOriginalPrice}
          settings={settings}
        />
      </div>

      <ProductTabs data={data} reviews={reviews?.items} />
      <StickyActionBar
        price={displayPrice}
        originalPrice={displayOriginalPrice}
        canBuy={!!selectedVariantId}
        zaloLink={zaloLink}
      />
    </div>
  );
}

// Sub-components for better structure

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link href="/" className="hover:underline">Trang chủ</Link>
      <span className="mx-2">/</span>
      <Link href="/san-pham" className="hover:underline">Sản phẩm</Link>
      <span className="mx-2">/</span>
      <span className="text-foreground">{title}</span>
    </nav>
  );
}

function ImageGallery({ productTitle, images, selectedImageId, setSelectedImageId }: any) {
  const handleSelectImage = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden border-muted/40 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImageId || 'skeleton'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-square w-full bg-gradient-to-b from-background to-muted/40"
          >
            {selectedImageId ? (
              <StorageImage imageId={selectedImageId} alt={productTitle} fit="contain" className="bg-white dark:bg-gray-900" />
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
      {images && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-visible">
          {images.map((p: any) => (
            <button
              key={String(p._id)}
              onClick={() => handleSelectImage(String(p.imageId))}
              className={`relative aspect-square w-full sm:w-auto min-w-[72px] overflow-hidden rounded-lg border bg-card transition-all ${selectedImageId === String(p.imageId) ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted'}`}
            >
              <StorageImage imageId={String(p.imageId)} alt={productTitle} fit="contain" className="bg-white dark:bg-gray-900" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo({ data, rating, variants, selectedVariantId, setSelectedVariantId, displayPrice, displayOriginalPrice, settings }: any) {
  const hasDiscount = displayPrice !== undefined && displayOriginalPrice && displayOriginalPrice > displayPrice;
  const zaloLink = (() => {
    const s: any = settings || {};
    const direct = s?.socialZalo || s?.zalo || s?.contactZalo || s?.zaloUrl;
    if (direct) return String(direct);
    const phone = s?.zaloPhone || s?.contactPhone || s?.phone || s?.hotline;
    if (phone) {
      const digits = String(phone).replace(/[^0-9]/g, "");
      if (digits) return `https://zalo.me/${digits}`;
    }
    return undefined;
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold leading-tight">{data.name}</h1>
        {data.status && String(data.status) !== "published" && (
          <Badge variant="outline" className="shrink-0">{String(data.status)}</Badge>
        )}
      </div>

      {data.shortDesc && <p className="text-lg text-muted-foreground">{data.shortDesc}</p>}

      <div className="flex flex-wrap items-center gap-4">
        {rating.count > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{rating.avg}</span>
            <span className="text-sm text-muted-foreground">({rating.count} đánh giá)</span>
          </div>
        )}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {displayPrice !== undefined ? (
              <div className="text-4xl font-extrabold text-primary">{formatPrice(displayPrice)}</div>
            ) : (
              <div className="text-2xl font-bold">Liên hệ</div>
            )}
            {hasDiscount && (
              <div className="text-xl text-muted-foreground line-through">{formatPrice(displayOriginalPrice)}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {variants && variants.length > 0 && (
        <div className="grid gap-3">
          <h2 className="text-lg font-semibold">Tuỳ chọn</h2>
          <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="gap-3">
            {variants.map((v: any) => (
              <Label key={String(v._id)} htmlFor={String(v._id)} className="flex items-center gap-4 rounded-lg border p-4 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <RadioGroupItem value={String(v._id)} id={String(v._id)} />
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{v.name}</span>
                    {v.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                  </div>
                  {v.note && <div className="mt-1 text-xs text-muted-foreground">{v.note}</div>}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">{formatPrice(v.price)}</div>
                  {v.originalPrice && v.originalPrice > v.price && (
                    <div className="text-xs text-muted-foreground line-through">{formatPrice(v.originalPrice)}</div>
                  )}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto flex-grow" disabled={!selectedVariantId || !zaloLink}>
          <a href={zaloLink || "#"} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" /> Lien he Zalo
          </a>
        </Button>
                {settings?.socialFacebook && (
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" /> Lien he Facebook
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ProductTabs({ data, reviews }: any) {
  return (
    <div className="mt-12 lg:mt-16">
      <Tabs defaultValue="description">
        <TabsList className="grid w-full grid-cols-2 md:w-[320px]">
          <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {data?.description ? (
                  <SafeHtml html={data.description} />
                ) : (
                  <p className="text-muted-foreground">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold">Đánh giá từ khách hàng</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <div key={String(r._id)} className="flex gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted stroke-muted-foreground'}`} />
                      ))}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">bởi {r.author || 'Khách'} - {new Date(r._creationTime).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-16" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-5 gap-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StickyActionBar({ price, originalPrice, canBuy, zaloLink }: { price?: number; originalPrice?: number; canBuy: boolean; zaloLink?: string }) {
  const hasDiscount = price !== undefined && originalPrice && originalPrice > price;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-baseline gap-2">
          {price !== undefined ? (
            <>
              <span className="text-xl font-extrabold text-primary">{formatPrice(price)}</span>
              {hasDiscount && <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice!)}</span>}
            </>
          ) : (
            <span className="text-base font-semibold">Liên hệ</span>
          )}
        </div>
        <Button size="sm" asChild disabled={!canBuy || !zaloLink}>
          <a href={zaloLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Lien he Zalo">
            <MessageCircle className="mr-2 h-4 w-4" /> Lien he Zalo
          </a>
        </Button>
      </div>
    </div>
  );
}

