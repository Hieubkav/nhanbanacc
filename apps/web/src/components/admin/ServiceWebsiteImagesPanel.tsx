"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreviewThumb } from "./ImagePreviewThumb";
import { toast } from "sonner";

export default function ServiceWebsiteImagesPanel({ serviceWebsiteId }: { serviceWebsiteId: string }) {
  const [imgPage] = useState(1);
  const [imgPageSize] = useState(100);
  const imgSort = useMemo(() => ({ field: "sortOrder", direction: "asc" as const }), []);
  const data = useQuery(api.service_website_images.listByServiceWebsite, { serviceWebsiteId: serviceWebsiteId as any, page: imgPage, pageSize: imgPageSize, sort: imgSort } as any);
  const items = data?.items ?? [];

  const create = useMutation(api.service_website_images.create);
  const remove = useMutation(api.service_website_images.deleteOne);
  const reorder = useMutation(api.service_website_images.reorder);

  // Library state
  const [q, setQ] = useState("");
  const [libPage, setLibPage] = useState(1);
  const [libPageSize] = useState(12);
  const [libSort] = useState<{ field: string; direction: "asc" | "desc" }>({ field: "sortOrder", direction: "asc" });
  const libData = useQuery(api.images.list, { q, page: libPage, pageSize: libPageSize, sort: libSort } as any);
  const libItems = libData?.items ?? [];
  const libHasMore = !!libData?.hasMore;
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSelected = () => setSelected({});

  const addSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) { toast.error("Chưa chọn ảnh nào"); return; }
    const existing = new Set((items ?? []).map((it: any) => String(it.imageId)));
    const toAdd = ids.filter((id) => !existing.has(String(id)));
    if (toAdd.length === 0) { toast.info("Tất cả ảnh đã có trong dịch vụ"); return; }
    let base = items.length > 0 ? (items[items.length - 1].sortOrder ?? items.length) : 0;
    for (const id of toAdd) {
      base += 1;
      await create({ dto: { serviceWebsiteId: serviceWebsiteId as any, imageId: id as any, sortOrder: base } as any } as any);
    }
    toast.success(`Đã thêm ${toAdd.length} ảnh vào dịch vụ`);
    clearSelected();
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!items.length) return;
    const idx = items.findIndex((x: any) => String(x._id) === String(id));
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const beforeId = dir === -1 ? items[targetIdx]._id : undefined;
    const afterId = dir === 1 ? items[targetIdx]._id : undefined;
    await reorder({ id: id as any, beforeId: beforeId as any, afterId: afterId as any, serviceWebsiteScopeId: serviceWebsiteId as any } as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ảnh dịch vụ</h2>
      </div>

      {/* Image library */}
      <div className="space-y-3 rounded-md border p-3">
        <div className="flex items-center gap-2">
          <Input placeholder="Tìm ảnh..." value={q} onChange={(e) => { setQ(e.target.value); setLibPage(1); }} className="w-[280px]" />
          <Button variant="outline" onClick={() => { setQ(""); setLibPage(1); }}>Xóa</Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {libItems.map((img: any) => (
            <button key={String(img._id)} type="button" onClick={() => toggleSelect(String(img._id))} className={`rounded-md border p-2 text-left hover:bg-accent ${selected[String(img._id)] ? 'ring-2 ring-primary' : ''}`}>
              <ImagePreviewThumb id={img._id} size={120} />
              <div className="mt-1 truncate text-xs" title={img.title || img.filename}>{img.title || img.filename}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Đã chọn: {Object.values(selected).filter(Boolean).length}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={libPage <= 1} onClick={() => setLibPage((p) => Math.max(1, p - 1))}>Trước</Button>
            <div className="text-sm">Trang {libPage}</div>
            <Button variant="outline" disabled={!libHasMore} onClick={() => setLibPage((p) => p + 1)}>Sau</Button>
            <Button onClick={addSelected}>Thêm vào dịch vụ</Button>
          </div>
        </div>
      </div>

      {/* Current list */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-[600px] w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">ImageId</th>
              <th className="p-2 text-left">Thứ tự</th>
              <th className="p-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td className="p-3" colSpan={4}>Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={4}>Chưa có ảnh</td></tr>
            ) : (
              items.map((row: any, idx: number) => (
                <tr key={String(row._id)} className="border-t">
                  <td className="p-2">
                    <ImagePreviewThumb id={row.imageId} />
                  </td>
                  <td className="p-2 align-top"><code className="text-xs">{String(row.imageId)}</code></td>
                  <td className="p-2 align-top">{row.sortOrder ?? idx + 1}</td>
                  <td className="p-2 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => move(String(row._id), -1)}>Lên</Button>
                      <Button size="sm" variant="outline" disabled={idx === items.length - 1} onClick={() => move(String(row._id), 1)}>Xuống</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove({ id: row._id as any } as any)}>Xóa</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

