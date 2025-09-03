"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

export function ImagePreviewThumb({ id, size = 48 }: { id: string; size?: number }) {
  const data = useQuery(api.images.getViewUrl, { id: id as any });
  const url = data?.url ?? null;
  return (
    <div className="h-12 w-12 overflow-hidden rounded border" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? (
        <img src={url} alt="preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">N/A</div>
      )}
    </div>
  );
}

