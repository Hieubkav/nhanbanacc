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
import { Star, CheckCircle2, MessageCircle, ShoppingCart, Tag, UserCircle, Facebook } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SafeHtml from "@/components/shared/safe-html";
import { cn } from "@/lib/utils";

// Helper to format price
function formatPrice(n: number) {
  if (isNaN(n)) return "";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
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
  // related products by same category
  const related = useQuery(
    api.products.listByFK,
    data ? ({ categoryId: data.categoryId, sort: { field: "sortOrder", direction: "asc" }, pageSize: 8 } as any) : undefined as any,
  );
  
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
    return <div className="text-center py-20 text-lg text-muted-foreground">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Breadcrumb title={productTitle} />

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
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
            zaloLink={zaloLink}
          />
        </div>

        <ProductTabs data={data} reviews={reviews?.items} />

        {related?.items?.filter((p: any) => String(p._id) !== String(productId))?.length ? (
          <section className="mt-16 lg:mt-24">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.items
                .filter((p: any) => String(p._id) !== String(productId))
                .map((p: any) => (
                  <Card key={String(p._id)} className="h-full overflow-hidden rounded-xl">
                    <CardHeader className="pb-2">
                      <h3 className="line-clamp-2 text-base font-semibold">{p.name}</h3>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {p.shortDesc ? <p className="line-clamp-3">{p.shortDesc}</p> : <span className="opacity-60">Không có mô tả</span>}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/san-pham/${p.slug}-${p._id}`}>
                          <Tag className="mr-2 h-4 w-4" /> Xem chi tiết
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </section>
        ) : null}
        <StickyActionBar
          price={displayPrice}
          originalPrice={displayOriginalPrice}
          canBuy={!!selectedVariantId}
          zaloLink={zaloLink}
        />
      </div>
    </div>
  );
}

// Sub-components for better structure

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li><Link href="/" className="hover:text-primary hover:underline">Trang chủ</Link></li>
        <li><span className="mx-2">/</span></li>
        <li><Link href="/san-pham" className="hover:text-primary hover:underline">Sản phẩm</Link></li>
        <li><span className="mx-2">/</span></li>
        <li className="truncate text-foreground" aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}

function ImageGallery({ productTitle, images, selectedImageId, setSelectedImageId }: any) {
  const handleSelectImage = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  return (
    <div className="flex flex-col gap-4 sticky top-24 self-start">
      <div className="overflow-hidden rounded-xl border shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImageId || 'skeleton'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative aspect-square w-full bg-white dark:bg-slate-900"
          >
            {selectedImageId ? (
              <StorageImage imageId={selectedImageId} alt={productTitle} fit="contain" />
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {images && images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((p: any) => (
            <motion.button
              key={String(p._id)}
              onClick={() => handleSelectImage(String(p.imageId))}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-white transition-all duration-200 dark:bg-slate-900",
                selectedImageId === String(p.imageId) 
                  ? 'border-primary shadow-md' 
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StorageImage imageId={String(p.imageId)} alt={productTitle} fit="contain" />
              {selectedImageId === String(p.imageId) && (
                <motion.div 
                  className="absolute inset-0 ring-2 ring-primary ring-offset-2"
                  layoutId="selected-thumbnail-ring"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo({ data, rating, variants, selectedVariantId, setSelectedVariantId, displayPrice, displayOriginalPrice, settings, zaloLink }: any) {
  const hasDiscount = displayPrice !== undefined && displayOriginalPrice && displayOriginalPrice > displayPrice;
  const discountPercentage = hasDiscount ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col gap-6">
      <div>
        {data.status && String(data.status) !== "published" && (
          <Badge variant="outline" className="mb-2">{String(data.status)}</Badge>
        )}
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{data.name}</h1>
      </div>

      {data.shortDesc && <p className="text-lg text-muted-foreground">{data.shortDesc}</p>}

      {rating.count > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(rating.avg) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted stroke-muted-foreground'}`} />
            ))}
          </div>
          <span className="font-bold text-muted-foreground">{rating.avg.toFixed(1)}</span>
          <a href="#reviews" className="text-sm text-muted-foreground hover:underline">({rating.count} đánh giá)</a>
        </div>
      )}
      
      <Separator />

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {displayPrice !== undefined ? (
            <>
              <div className="text-4xl font-extrabold text-primary">{formatPrice(displayPrice)}</div>
              {hasDiscount && (
                <div className="text-xl text-muted-foreground line-through">{formatPrice(displayOriginalPrice)}</div>
              )}
            </>
          ) : (
            <div className="text-2xl font-bold text-primary">Liên hệ</div>
          )}
        </div>
        {hasDiscount && (
          <Badge variant="destructive" className="gap-1">
            <Tag className="h-3 w-3" />
            Giảm {discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Variants Section */}
      {variants && variants.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Tuỳ chọn</h2>
          <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId} className="gap-3">
            {variants.map((v: any) => {
              const isSelected = selectedVariantId === String(v._id);
              return (
                <Label key={String(v._id)} htmlFor={String(v._id)} className={cn(
                  "flex items-center gap-4 rounded-lg border p-4 transition-all cursor-pointer",
                  isSelected ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-muted/50"
                )}>
                  <RadioGroupItem value={String(v._id)} id={String(v._id)} className="sr-only" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      {v.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                    </div>
                    {v.note && <div className="mt-1 text-sm text-muted-foreground">{v.note}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{formatPrice(v.price)}</div>
                    {v.originalPrice && v.originalPrice > v.price && (
                      <div className="text-sm text-muted-foreground line-through">{formatPrice(v.originalPrice)}</div>
                    )}
                  </div>
                  <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{opacity: 0, scale: 0.5}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.5}}>
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  )}
                  </AnimatePresence>
                </Label>
              )
            })}
          </RadioGroup>
        </div>
      )}

      <Separator className="my-2" />

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <motion.div className="w-full sm:w-auto flex-grow" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
          <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40" disabled={!selectedVariantId || !zaloLink}>
            <a href={zaloLink || "#"} target="_blank" rel="noopener noreferrer">
              <ZaloIcon className="mr-2 h-5 w-5" /> Liên hệ qua Zalo
            </a>
          </Button>
        </motion.div>
        {settings?.socialFacebook && (
          <motion.div className="w-full sm:w-auto" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="mr-2 h-5 w-5" /> Liên hệ qua Facebook
              </a>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ProductTabs({ data, reviews }: any) {
  return (
    <div id="reviews" className="mt-16 lg:mt-24">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
          <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá ({reviews?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-8">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <div className="prose prose-lg max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:font-semibold">
                {data?.description ? (
                  <SafeHtml html={data.description} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-8">
          <Card className="border-none shadow-none">
            <CardHeader className="text-center">
              <h3 className="text-2xl font-bold">Đánh giá từ khách hàng</h3>
            </CardHeader>
            <CardContent className="mt-6 max-w-3xl mx-auto space-y-8">
              {reviews && reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <Card key={String(r._id)} className="p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted rounded-full p-2">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{r.author || 'Khách'}</p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted stroke-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(r._creationTime).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="mt-3 text-muted-foreground italic">"{r.comment}"</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
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
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb Skeleton */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Skeleton className="h-5 w-16" />
        <span>/</span>
        <Skeleton className="h-5 w-20" />
        <span>/</span>
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="grid grid-cols-5 gap-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-6 w-1/2" />
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <Separator className="my-2" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-12 flex-grow rounded-lg" />
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-sm sm:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Giá</span>
          {price !== undefined ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
              {hasDiscount && <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice!)}</span>}
            </div>
          ) : (
            <span className="text-base font-semibold">Liên hệ</span>
          )}
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button size="sm" asChild disabled={!canBuy || !zaloLink} className="shadow-lg">
            <a href={zaloLink || "#"} target="_blank" rel="noopener noreferrer" aria-label="Liên hệ qua Zalo">
              <MessageCircle className="mr-2 h-4 w-4" /> Liên hệ
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
