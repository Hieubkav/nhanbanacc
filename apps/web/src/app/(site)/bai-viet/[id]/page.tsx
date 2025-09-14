"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StorageImage } from "@/components/shared/storage-image";
import SafeHtml from "@/components/shared/safe-html";
import { cn, slugify } from "@/lib/utils";
import { Facebook, Link as LinkIcon, Share2 } from "lucide-react";
import { useSound } from "@/lib/use-sound";

// No TOC per request

export default function BaiVietDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const raw = String(id);
  const extractedId = raw.includes("-") ? (raw.split("-").pop() as string) : raw;

  // Data
  const data = useQuery(api.posts.getById, { id: extractedId as any });
  const pics = useQuery(
    api.post_images.listByPost,
    { postId: extractedId as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any
  );
  const related = useQuery(api.posts.list, {
    sort: { field: "updatedAt", direction: "desc" },
    pageSize: 8,
  } as any);
  const allPostImages = useQuery(api.post_images.list, { pageSize: 1000 } as any);
  const allImages = useQuery(api.images.list, { pageSize: 1000 } as any);

  // Derived
  const title = (data as any)?.title ?? "Đang tải...";
  const excerpt = (data as any)?.excerpt ?? "";
  const heroId = (data as any)?.thumbnailId ? String((data as any).thumbnailId) : undefined;
  const updatedDate = (data as any)?.updatedAt
    ? new Date((data as any).updatedAt).toLocaleDateString("vi-VN")
    : undefined;

  // Beep when article ready (per request)
  const { beep } = useSound();
  const didBeepRef = useRef(false);
  useEffect(() => {
    const ready = data !== undefined && data !== null;
    if (!ready || didBeepRef.current) return;
    try {
      beep();
      didBeepRef.current = true;
    } catch {}
  }, [data, beep]);

  // Content ref for reading progress only
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Reading progress based on content block
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return setProgress(0);
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(window.scrollY - (el.offsetTop - 80), 0), total);
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll as any);
  }, []);

  // Map related posts with first image id if any
  const relatedWithImages = useMemo(() => {
    const rows = (related?.items ?? []).filter((p: any) => String(p._id) !== String(extractedId));
    const links = (allPostImages?.items ?? []) as any[];
    const imgs = (allImages?.items ?? []) as any[];
    const imageExists = (id?: string) => (id ? imgs.some((x: any) => String(x._id) === String(id)) : false);
    return rows.slice(0, 4).map((p: any) => {
      const linked = links.find((l: any) => String(l.postId) === String(p._id));
      const thumb = p?.thumbnailId ? String(p.thumbnailId) : undefined;
      const candidate = imageExists(thumb) ? thumb : linked ? String(linked.imageId) : undefined;
      return { ...p, firstImageId: candidate };
    });
  }, [related?.items, allPostImages?.items, allImages?.items, extractedId]);

  // Fallback states
  if (data === undefined) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-72 w-full animate-pulse rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }
  if (data === null) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Không tìm thấy bài viết.
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Reading progress */}
      <div className="sticky top-0 z-30 h-1 w-full bg-transparent">
        <div className="h-1 bg-primary/80" style={{ width: `${progress}%` }} />
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/bai-viet" className="hover:underline">Bài viết</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <div className="mx-auto w-full max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {updatedDate ? <span>Cập nhật: {updatedDate}</span> : null}
                {(data as any)?.status && String((data as any).status) !== "published" ? (
                  <Badge variant="secondary">{String((data as any).status)}</Badge>
                ) : null}
              </div>

              {/* Hero */}
              {heroId ? (
                <div className="relative mt-6 overflow-hidden rounded-2xl border bg-white/50 shadow-sm dark:bg-slate-900/40">
                  <div className="aspect-[16/9] w-full">
                    <StorageImage imageId={heroId} alt={title} fit="cover" />
                  </div>
                </div>
              ) : null}

              {/* Excerpt */}
              {excerpt ? (
                <p className="mt-4 text-base text-muted-foreground">{excerpt}</p>
              ) : null}

              {/* Share */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <ShareButtons title={title} />
              </div>

              <Separator className="my-6" />

              <article ref={contentRef} className={cn(
                "prose prose-sm max-w-none dark:prose-invert",
                "leading-relaxed break-words",
              )}>
                {(data as any)?.content ? (
                  <SafeHtml html={String((data as any).content)} />
                ) : (
                  <p className="text-muted-foreground">Chưa có nội dung.</p>
                )}
              </article>

              {pics?.items?.length ? (
                <>
                  <Separator className="my-8" />
                  <div>
                    <h2 className="mb-3 text-lg font-semibold">Hình ảnh kèm theo</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {pics.items.map((p: any) => (
                        <Card key={String(p._id)} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative aspect-video w-full">
                              <StorageImage imageId={String(p.imageId)} alt={title} fit="cover" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {relatedWithImages?.length ? (
                <section className="mt-12">
                  <h2 className="mb-4 text-xl font-semibold">Bài viết liên quan</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {relatedWithImages.map((p: any) => {
                      const base = p?.title ? slugify(String(p.title)) : undefined;
                      const slugOrId = base ? `${base}-${String(p._id)}` : String(p._id);
                      return (
                        <Link key={String(p._id)} href={`/bai-viet/${slugOrId}`} className="group">
                          <Card className="h-full overflow-hidden transition hover:shadow-md">
                            <CardContent className="p-0">
                              <div className="relative aspect-[16/9] w-full overflow-hidden bg-white dark:bg-slate-900">
                                {p.firstImageId ? (
                                  <StorageImage imageId={String(p.firstImageId)} alt={p.title} fit="cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    Không có ảnh
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                                  {p.title}
                                </h3>
                                {p.excerpt ? (
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
                                ) : null}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </motion.div>
        </div>
      </div>
    </div>
  );
}

function ShareButtons({ title, fullWidth }: { title: string; fullWidth?: boolean }) {
  const { beep } = useSound();
  const share = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title, url });
        beep();
        return;
      }
      await navigator.clipboard.writeText(url);
      beep();
      alert("Đã copy liên kết vào clipboard");
    } catch {}
  };

  const shareFb = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      window.open(href, "_blank", "noopener,noreferrer");
      beep();
    } catch {}
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      beep();
    } catch {}
  };

  return (
    <div className={cn("flex items-center gap-2", fullWidth && "w-full") }>
      <Button onClick={share} className={cn(fullWidth && "flex-1") }>
        <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
      </Button>
      <Button variant="outline" onClick={shareFb} className={cn(fullWidth && "flex-1") }>
        <Facebook className="mr-2 h-4 w-4" /> Facebook
      </Button>
      <Button variant="ghost" onClick={copy} className={cn(fullWidth && "flex-1") }>
        <LinkIcon className="mr-2 h-4 w-4" /> Copy link
      </Button>
    </div>
  );
}
