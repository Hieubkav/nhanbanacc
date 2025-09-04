"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/shared/storage-image";

export default function HeroSlider() {
  const sliders = useQuery(api.sliders.list, { filters: [{ field: "isVisible", value: true }], sort: { field: "sortOrder", direction: "asc" }, pageSize: 10 } as any);
  const settings = useQuery(api.settings.getOne);
  const items = useMemo(() => sliders?.items ?? [], [sliders]);

  const [i, setI] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const cur = items[i];
  if (!cur) return null;

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Slider Section */}
          <div className="relative h-[300px] sm:h-[350px] rounded-2xl overflow-hidden shadow-lg">
            {cur.imageId ? (
              <StorageImage imageId={String(cur.imageId)} alt={cur.title ?? "Slide"} className="object-cover w-full h-full" />
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-white absolute inset-0" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  <span className="text-gold">{cur.title ?? "Khám phá ngay hôm nay"}</span>
                </h2>
                {cur.subtitle ? <p className="mt-2 text-sm sm:text-base">{cur.subtitle}</p> : null}
                <div className="mt-4">
                  {cur.buttonLink ? (
                    <Button asChild size="sm" className="rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all bg-gold hover:bg-opacity-90 text-white border-0">
                      <a href={cur.buttonLink} target="_blank" rel="noreferrer">
                        {cur.buttonText ?? "Xem chi tiết"}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              {items.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={"h-2 w-2 rounded-full transition-all duration-300 " + (idx === i ? "bg-gold w-4" : "bg-white/50 hover:bg-white/80")}
                />)
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6 flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                {settings?.siteName ?? "NhanBanACC"}
              </h1>
              {settings?.slogan ? (
                <p className="text-2xl sm:text-3xl md:text-4xl text-gold font-medium">
                  {settings.slogan}
                </p>
              ) : null}
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button 
                onClick={() => {
                  const element = document.getElementById('products');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="rounded-full px-8 py-4 text-lg font-semibold bg-gold hover:bg-gold/90 text-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                Khám phá sản phẩm
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  const element = document.getElementById('posts');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="rounded-full px-8 py-4 text-lg font-semibold border-2 border-gold text-gold hover:bg-gold/10 shadow-lg hover:shadow-xl transition-all"
              >
                Đọc bài viết
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
