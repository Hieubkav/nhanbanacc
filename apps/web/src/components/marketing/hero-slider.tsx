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
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-yellow-50/40 to-white">
      <div className="relative h-[320px] w-full sm:h-[460px]">
        {cur.imageId ? (
          <StorageImage imageId={String(cur.imageId)} alt={cur.title ?? "Slide"} />
        ) : (
          <div className="bg-gradient-to-br from-yellow-50 to-white absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="max-w-3xl text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            <h1 className="text-3xl font-bold sm:text-5xl"><span className="text-yellow-400">{cur.title ?? "Khám phá ngay hôm nay"}</span></h1>
            {cur.subtitle ? <p className="mt-2 text-sm sm:text-lg">{cur.subtitle}</p> : null}
            <div className="mt-5">
              {cur.buttonLink ? (
                <Button asChild>
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
      <div className="flex items-center gap-2 p-3">
        {items.map((_: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={"h-2 w-2 rounded-full transition " + (idx === i ? "bg-yellow-500" : "bg-zinc-300/70 hover:bg-zinc-400")}
          />)
        )}
      </div>
    </section>
  );
}
