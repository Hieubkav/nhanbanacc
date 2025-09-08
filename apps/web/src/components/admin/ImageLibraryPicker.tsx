"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePreviewThumb } from "./ImagePreviewThumb";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  initialSelected?: string[];
  pageSize?: number;
};

export default function ImageLibraryPicker({ open, onClose, onConfirm, initialSelected, pageSize = 18 }: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries((initialSelected ?? []).map((id) => [String(id), true]))
  );

  const sort = { field: "sortOrder", direction: "asc" as const };
  const data = useQuery(api.images.list, { q, page, pageSize, sort } as any);
  const items = data?.items ?? [];

  // Create a set of already attached image IDs for quick lookup
  const attachedImageIds = useMemo(() => new Set(initialSelected ?? []), [initialSelected]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAllPage = () => setSelected((s) => ({ ...s, ...Object.fromEntries(items.map((i: any) => [String(i._id), true])) }));
  const clearAll = () => setSelected({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 top-10 mx-auto flex h-[calc(100vh-5rem)] max-w-5xl flex-col rounded-lg border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-semibold">Chọn ảnh từ thư viện</div>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Input
                placeholder="Tìm ảnh theo tiêu đề / tên file..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="max-w-sm"
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={selectAllPage}>Chọn tất cả trang</Button>
                <Button variant="outline" onClick={clearAll}>Bỏ chọn</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {!data ? (
                <div className="col-span-full p-3 text-sm">Đang tải...</div>
              ) : items.length === 0 ? (
                <div className="col-span-full p-3 text-sm text-muted-foreground">Không có ảnh</div>
              ) : (
                items.map((img: any) => {
                  const imageId = String(img._id);
                  const isSelected = !!selected[imageId];
                  const isAttached = attachedImageIds.has(imageId);
                  
                  return (
                    <label key={imageId} className="group relative cursor-pointer rounded-md border p-2 hover:border-primary">
                      <div className="absolute left-2 top-2 z-10">
                        <input type="checkbox" checked={isSelected} onChange={() => toggle(imageId)} />
                      </div>
                      {isAttached && (
                        <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <ImagePreviewThumb id={img._id} size={140} />
                      <div className="mt-1 truncate text-xs text-muted-foreground" title={img.title || img.filename}>
                        {img.title || img.filename}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="border-t p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Đã chọn: {Object.values(selected).filter(Boolean).length} | Đã thêm: {attachedImageIds.size}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
              <div className="text-sm">Trang {page}</div>
              <Button variant="outline" disabled={!data?.hasMore} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button onClick={() => {
              const selectedIds = Object.keys(selected).filter((k) => selected[k]);
              onConfirm(selectedIds);
            }}>Cập nhật ảnh đã chọn cho sản phẩm</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

