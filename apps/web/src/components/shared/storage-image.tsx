"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { cn } from "@/lib/utils";

export function StorageImage({
  imageId,
  alt,
  className,
  imgClassName,
  priority = false,
  fit = "cover",
  layout = "fill",
}: {
  imageId: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  // layout = "fill": phủ kín khung (absolute inset-0 h-full w-full)
  // layout = "intrinsic": tôn trọng tỉ lệ gốc, w-full h-auto
  layout?: "fill" | "intrinsic";
}) {
  const r = useQuery(api.images.getViewUrl, { id: imageId as any });
  const url = r?.url ?? null;
  return (
    <div className={cn(layout === "fill" ? "absolute inset-0 h-full w-full" : "", className)}>
      {url ? (
        // Dùng img thuần để không cần cấu hình remotePatterns cho Next/Image
        <img
          src={url}
          alt={alt ?? "image"}
          className={cn(
            layout === "fill" ? "h-full w-full" : "w-full h-auto block",
            layout === "fill"
              ? (fit === "contain" ? "object-contain" : "object-cover")
              : undefined,
            imgClassName,
          )}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className={cn(layout === "fill" ? "bg-muted absolute inset-0" : "bg-muted w-full h-[200px]")} />
      )}
    </div>
  );
}
