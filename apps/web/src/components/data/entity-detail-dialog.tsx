"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle2, Tag, CalendarClock, Phone, Mail, Facebook, Youtube, X } from "lucide-react";
import { StorageImage } from "@/components/shared/storage-image";
import SafeHtml from "@/components/shared/safe-html";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/use-media-query";
import { useSound } from "@/lib/use-sound";
import { Separator } from "@/components/ui/separator";

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
  const settings = useQuery(api.settings.getOne);

  const title = useMemo(() => (data ? (data as any)?.name ?? "" : ""), [data]);
  const shortDesc = useMemo(() => (data ? (data as any)?.shortDesc ?? (data as any)?.description ?? "" : ""), [data]);
  const longDesc = useMemo(() => (data ? (data as any)?.description ?? "" : ""), [data]);

  // Active hero image switching
  const firstHeroId = pics?.items?.[0]?.imageId ? String(pics.items[0].imageId) : undefined;
  const [activeImageId, setActiveImageId] = useState<string | undefined>(firstHeroId);
  useEffect(() => {
    setActiveImageId(firstHeroId);
  }, [firstHeroId]);

  // Price stats
  const priceStats = useMemo(() => {
    const vs = variants?.items ?? [];
    if (!vs.length) return null;
    const minPrice = Math.min(...vs.map((v: any) => v.price));
    const minOriginal = Math.min(...vs.map((v: any) => (v.originalPrice ? v.originalPrice : Infinity)));
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

  // Sticky section nav for single-scroll UI
  const productSections = [
    { id: "p-overview", label: "Tong quan" },
    { id: "p-variants", label: "Bien the & gia" },
    { id: "p-reviews", label: "Danh gia" },
    { id: "p-images", label: "Hinh anh" },
  ];
  const [activeSec, setActiveSec] = useState<string>(productSections[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSec(e.target.id);
          }
        }
      },
      { root: null, threshold: 0.12, rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of productSections) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pics?.items?.length, variants?.items?.length, reviews?.items?.length]);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Collapsible controls
  const [expandOverview, setExpandOverview] = useState(false);
  const [variantsLimit, setVariantsLimit] = useState(5);
  const [reviewsLimit, setReviewsLimit] = useState(3);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
          {title || (data === undefined ? "Dang tai..." : "Khong tim thay")}
          <Badge variant="secondary">San pham</Badge>
        </DialogTitle>
        {shortDesc ? <DialogDescription>{shortDesc}</DialogDescription> : null}
      </DialogHeader>

      {activeImageId ? (
        <div className="relative mt-2 h-56 w-full overflow-hidden rounded-xl sm:h-64 md:h-72">
          <StorageImage imageId={activeImageId} alt={title} fit="contain" className="bg-white dark:bg-gray-900" />
          {priceStats ? (
            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
              Tu {formatPrice(priceStats.minPrice)}
              {priceStats.minOriginal ? (
                <span className="ml-2 opacity-80 line-through">{formatPrice(priceStats.minOriginal)}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {pics?.items?.length ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {pics.items.slice(0, 12).map((p: any) => {
            const id = String(p.imageId);
            const isActive = id === activeImageId;
            return (
              <button
                key={String(p._id)}
                type="button"
                onClick={() => setActiveImageId(id)}
                className={`relative h-20 w-full overflow-hidden rounded border transition-all ${isActive ? "border-2 border-gold" : "hover:border-gold/60"}`}
                aria-label="Xem anh"
              >
                <StorageImage imageId={id} alt={title} fit="contain" className="bg-white dark:bg-gray-900" />
              </button>
            );
          })}
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
        {(data as any)?.updatedAt ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            {new Date((data as any).updatedAt).toLocaleDateString("vi-VN")}
          </span>
        ) : null}
      </div>

      {/* Sticky section nav */}
      <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 border-b bg-background/80 px-5 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2 overflow-x-auto">
          {productSections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                activeSec === s.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      <section id="p-overview" className="scroll-mt-24">
        <div className="mt-3">
          {longDesc ? (
            <div className="relative">
              <div className={`text-sm leading-relaxed whitespace-pre-wrap transition-all ${!expandOverview ? "max-h-32 overflow-hidden" : ""}`}>
                {longDesc}
              </div>
              {!expandOverview && longDesc && String(longDesc).length > 280 ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
              ) : null}
              {longDesc && String(longDesc).length > 280 ? (
                <button className="mt-2 text-sm font-medium text-primary" onClick={() => setExpandOverview((v) => !v)}>
                  {expandOverview ? "Thu gon" : "Xem them"}
                </button>
              ) : null}
            </div>
          ) : null}

          {Array.isArray((data as any)?.features) && (data as any)!.features!.length ? (
            <ul className="mt-3 grid list-disc gap-1 pl-5 text-sm">
              {(data as any).features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Chua co dac diem noi bat.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {settings?.phone ? (
              <Button variant="outline" className="rounded-full" onClick={() => window.open(`tel:${settings.phone}`, "_blank")}>
                <Phone className="mr-2 h-4 w-4" /> {settings.phone}
              </Button>
            ) : null}
            {settings?.email ? (
              <Button variant="outline" className="rounded-full" onClick={() => window.open(`mailto:${settings.email}`, "_blank")}>
                <Mail className="mr-2 h-4 w-4" /> {settings.email}
              </Button>
            ) : null}
            {settings?.socialFacebook ? (
              <Button variant="outline" className="rounded-full" onClick={() => window.open(settings.socialFacebook, "_blank")}>
                <Facebook className="mr-2 h-4 w-4" /> Facebook
              </Button>
            ) : null}
            {settings?.socialTiktok ? (
              <Button variant="outline" className="rounded-full" onClick={() => window.open(settings.socialTiktok, "_blank")}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                TikTok
              </Button>
            ) : null}
            {settings?.socialYoutube ? (
              <Button variant="outline" className="rounded-full" onClick={() => window.open(settings.socialYoutube, "_blank")}>
                <Youtube className="mr-2 h-4 w-4" /> YouTube
              </Button>
            ) : null}
            {priceStats ? (
              <span className="text-sm text-muted-foreground">Gia tu {formatPrice(priceStats.minPrice)}</span>
            ) : null}
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Variants & Price */}
      <section id="p-variants" className="scroll-mt-24">
        <h3 className="text-base font-semibold">Bien the & gia</h3>
        <div className="mt-3">
          {variants?.items?.length ? (
            <div className="grid gap-2">
              {(variants.items as any[]).slice(0, variantsLimit).map((v: any) => (
                <div key={String(v._id)} className="flex items-start justify-between rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.name}</span>
                      {v.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mac dinh
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
              {variants.items.length > variantsLimit ? (
                <Button variant="ghost" className="justify-center" onClick={() => setVariantsLimit(variants.items.length)}>
                  Xem them {variants.items.length - variantsLimit}
                </Button>
              ) : null}
              {variants.items.length > 5 && variantsLimit >= variants.items.length ? (
                <Button variant="ghost" className="justify-center" onClick={() => setVariantsLimit(5)}>
                  Thu gon
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chua co bien the nao.</p>
          )}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Reviews */}
      <section id="p-reviews" className="scroll-mt-24">
        <h3 className="text-base font-semibold">Danh gia</h3>
        <div className="mt-2 text-sm text-muted-foreground">
          {avgRating.count ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {avgRating.avg} ({avgRating.count})
            </span>
          ) : (
            <span>Chua co danh gia.</span>
          )}
        </div>
        <div className="mt-3">
          {reviews?.items?.length ? (
            <div className="grid gap-3">
              {(reviews.items as any[]).slice(0, reviewsLimit).map((r: any) => (
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
              {reviews.items.length > reviewsLimit ? (
                <Button variant="ghost" className="justify-center" onClick={() => setReviewsLimit(reviews.items.length)}>
                  Xem tat ca {reviews.items.length}
                </Button>
              ) : null}
              {reviews.items.length > 3 && reviewsLimit >= reviews.items.length ? (
                <Button variant="ghost" className="justify-center" onClick={() => setReviewsLimit(3)}>
                  Thu gon
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Images */}
      <section id="p-images" className="scroll-mt-24">
        <h3 className="text-base font-semibold">Hinh anh</h3>
        <div className="mt-3">
          {pics?.items?.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {pics.items.map((p: any) => (
                <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
                  <StorageImage imageId={String(p.imageId)} alt={title} fit="contain" className="bg-white dark:bg-gray-900" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chua co hinh anh.</p>
          )}
        </div>
      </section>
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

  // Sticky section nav for single-scroll
  const postSections = [
    { id: "post-content", label: "Noi dung" },
    { id: "post-images", label: "Hinh anh" },
    { id: "post-meta", label: "Thong tin" },
  ];
  const [activeSec, setActiveSec] = useState<string>(postSections[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveSec(e.target.id);
      },
      { root: null, threshold: 0.12, rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of postSections) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pics?.items?.length]);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const [expandContent, setExpandContent] = useState(false);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
          {title || (data === undefined ? "Dang tai..." : "Khong tim thay")}
          <Badge variant="secondary">Bai viet</Badge>
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

      {/* Sticky nav */}
      <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 border-b bg-background/80 px-5 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2 overflow-x-auto">
          {postSections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                activeSec === s.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section id="post-content" className="scroll-mt-24">
        <h3 className="text-base font-semibold">Noi dung</h3>
        <div className="mt-3">
          {(data as any)?.content ? (
            <div className="relative">
              <div className={`prose prose-sm max-w-none transition-all dark:prose-invert ${!expandContent ? "max-h-60 overflow-hidden" : ""}`}>
                <SafeHtml html={(data as any).content} />
              </div>
              {!expandContent ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
              ) : null}
              <div className="mt-2">
                <Button variant="ghost" size="sm" onClick={() => setExpandContent((v) => !v)}>
                  {expandContent ? "Thu gon" : "Xem them"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chua co noi dung.</p>
          )}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Images */}
      <section id="post-images" className="scroll-mt-24">
        <h3 className="text-base font-semibold">Hinh anh</h3>
        <div className="mt-3">
          {pics?.items?.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {pics.items.map((p: any) => (
                <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
                  <StorageImage imageId={String(p.imageId)} alt={title} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chua co hinh anh kem theo.</p>
          )}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Meta */}
      <section id="post-meta" className="scroll-mt-24 text-sm text-muted-foreground">
        <h3 className="text-base font-semibold text-foreground">Thong tin</h3>
        <div className="mt-2">Cap nhat: {new Date((data as any)?.updatedAt ?? (data as any)?.createdAt ?? Date.now()).toLocaleString("vi-VN")}</div>
        {(data as any)?.slug ? <div>Slug: {(data as any).slug}</div> : null}
        {(data as any)?.status && String((data as any).status) !== "published" ? (
          <div>Trang thai: {(data as any).status}</div>
        ) : null}
      </section>
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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { beep } = useSound();

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) beep();
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[92vh] w-full rounded-t-2xl p-0 focus:outline-none data-[state=open]:duration-500"
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => handleOpenChange(false)}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-foreground transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-full overflow-y-auto px-5 pb-8 pt-5">
            {kind === "product" ? <ProductDetail id={id} /> : <PostDetail id={id} />}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl p-0 sm:rounded-xl">
        <button
          type="button"
          aria-label="Đóng"
          onClick={() => handleOpenChange(false)}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-foreground transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="max-h-[85vh] overflow-y-auto p-6">
          {kind === "product" ? <ProductDetail id={id} /> : <PostDetail id={id} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
