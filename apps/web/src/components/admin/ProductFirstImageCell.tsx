"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { ImagePreviewThumb } from "./ImagePreviewThumb";

export default function ProductFirstImageCell({ productId, size = 56 }: { productId: string; size?: number }) {
  const list = useQuery(api.product_images.listByProduct, {
    productId: productId as any,
    page: 1,
    pageSize: 1,
    sort: { field: "sortOrder", direction: "asc" },
  } as any);
  const first = list?.items?.[0];
  if (!first) {
    return (
      <div className="h-14 w-14 rounded border text-xs text-muted-foreground grid place-items-center" style={{ width: size, height: size }}>
        N/A
      </div>
    );
  }
  return <ImagePreviewThumb id={first.imageId} size={size} />;
}
