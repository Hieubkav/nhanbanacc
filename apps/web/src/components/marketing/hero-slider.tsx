"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/shared/storage-image";

export default function HeroSlider() {
  const sliders = useQuery(api.sliders.list, { filters: [{ field: "isVisible", value: true }], sort: { field: "sortOrder", direction: "asc" }, pageSize: 10 } as any);
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
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl dark:from-primary/10 dark:to-primary/5">
      <div className="relative h-[320px] w-full sm:h-[480px]">
        {cur.imageId ? (
          <StorageImage imageId={String(cur.imageId)} alt={cur.title ?? "Slide"} className="object-cover" />
        ) : (
          <div className="bg-gradient-to-br from-yellow-50 to-white absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="max-w-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl font-extrabold sm:text-5xl md:text-6xl animate-fade-in-up">
              <span className="text-yellow-400">{cur.title ?? "Khám phá ngay hôm nay"}</span>
            </h1>
            {cur.subtitle ? <p className="mt-3 text-sm sm:text-lg md:text-xl animate-fade-in-up animation-delay-200">{cur.subtitle}</p> : null}
            <div className="mt-6 animate-fade-in-up animation-delay-400">
              {cur.buttonLink ? (
                <Button asChild size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  <a href={cur.buttonLink} target="_blank" rel="noreferrer">
                    {cur.buttonText ?? "Xem chi tiết"}
                  </a>
                </Button>
              ) : null}
            </div>
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
            className={"h-3 w-3 rounded-full transition-all duration-300 " + (idx === i ? "bg-yellow-400 w-6" : "bg-white/50 hover:bg-white/80")}
          />)
        )}
      </div>
    </section>
  );
}
