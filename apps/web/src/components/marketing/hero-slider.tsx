"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { StorageImage } from "@/components/shared/storage-image";

// HeroSlider: chỉ dùng ảnh; luôn full-width; chiều cao tự theo ảnh; tôn trọng tỉ lệ gốc
export default function HeroSlider() {
  const sliders = useQuery(api.sliders.list, {
    filters: [{ field: "isVisible", value: true }],
    sort: { field: "sortOrder", direction: "asc" },
    pageSize: 10,
  } as any);

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
    <section className="relative w-full overflow-hidden">
      <div className="w-full">
        {cur.imageId ? (
          <StorageImage
            imageId={String(cur.imageId)}
            alt={cur.title ?? "Slide"}
            layout="intrinsic"
            fit="contain"
            className="block"
            imgClassName="w-full h-auto block"
          />
        ) : (
          <div className="w-full h-[200px] bg-muted" />
        )}
      </div>
    </section>
  );
}

