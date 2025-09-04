"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StorageImage } from "@/components/shared/storage-image";

type Kind = "product" | "post";

function ProductDetail({ id }: { id: string }) {
  const data = useQuery(api.products.getById, { id: id as any });
  const pics = useQuery(api.product_images.listByProduct, { productId: id as any, sort: { field: "sortOrder", direction: "asc" }, pageSize: 10 } as any);
  const images = useQuery(api.images.getManyByIds, pics?.items?.length ? { ids: pics.items.map((p: any) => p.imageId) as any } : (undefined as any));
  const title = useMemo(() => (data ? (data as any)?.name ?? "" : ""), [data]);
  const desc = useMemo(
    () => (data ? (data as any)?.shortDesc ?? (data as any)?.description ?? "" : ""),
    [data],
  );
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
          {title || (data === undefined ? "Đang tải..." : "Không tìm thấy")}
          <Badge variant="secondary">Sản phẩm</Badge>
        </DialogTitle>
        {desc ? <DialogDescription>{desc}</DialogDescription> : null}
      </DialogHeader>
      {pics?.items?.length ? (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {pics.items.map((p: any) => (
            <div key={String(p._id)} className="relative h-24 w-full overflow-hidden rounded border">
              <StorageImage imageId={String(p.imageId)} alt={title} />
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

function PostDetail({ id }: { id: string }) {
  const data = useQuery(api.posts.getById, { id: id as any });
  const title = useMemo(() => (data ? (data as any)?.title ?? "" : ""), [data]);
  const desc = useMemo(() => (data ? (data as any)?.excerpt ?? "" : ""), [data]);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {title || (data === undefined ? "Đang tải..." : "Không tìm thấy")}
          <Badge variant="secondary">Bài viết</Badge>
        </DialogTitle>
        {desc ? <DialogDescription>{desc}</DialogDescription> : null}
      </DialogHeader>
    </>
  );
}

export function EntityDetailDialog({ open, onOpenChange, kind, id }: { open: boolean; onOpenChange: (o: boolean) => void; kind: Kind; id: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {kind === "product" ? <ProductDetail id={id} /> : <PostDetail id={id} />}
        {/* Có thể mở rộng phần thân chi tiết tại đây */}
      </DialogContent>
    </Dialog>
  );
}
