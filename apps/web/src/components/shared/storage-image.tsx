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
}: {
  imageId: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const r = useQuery(api.images.getViewUrl, { id: imageId as any });
  const url = r?.url ?? null;
  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      {url ? (
        // Dùng img thuần để không cần cấu hình remotePatterns cho Next/Image
        <img
          src={url}
          alt={alt ?? "image"}
          className={cn(
            "h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover",
            imgClassName,
          )}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="bg-muted absolute inset-0" />
      )}
    </div>
  );
}

