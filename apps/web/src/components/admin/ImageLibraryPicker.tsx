"use client";

import { useState } from "react";
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

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAllPage = () => setSelected((s) => ({ ...s, ...Object.fromEntries(items.map((i: any) => [String(i._id), true])) }));
  const clearAll = () => setSelected({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 top-10 mx-auto w-[95vw] max-w-5xl rounded-lg border bg-background shadow-lg">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-semibold">Chọn ảnh từ thư viện</div>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
        <div className="p-3 space-y-3">
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
              items.map((img: any) => (
                <label key={String(img._id)} className="group relative cursor-pointer rounded-md border p-2 hover:border-primary">
                  <div className="absolute left-2 top-2 z-10">
                    <input type="checkbox" checked={!!selected[String(img._id)]} onChange={() => toggle(String(img._id))} />
                  </div>
                  <ImagePreviewThumb id={img._id} size={140} />
                  <div className="mt-1 truncate text-xs text-muted-foreground" title={img.title || img.filename}>
                    {img.title || img.filename}
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Đã chọn: {Object.values(selected).filter(Boolean).length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
              <div className="text-sm">Trang {page}</div>
              <Button variant="outline" disabled={!data?.hasMore} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-3">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onConfirm(Object.keys(selected).filter((k) => selected[k]))}>Thêm ảnh đã chọn</Button>
        </div>
      </div>
    </div>
  );
}

