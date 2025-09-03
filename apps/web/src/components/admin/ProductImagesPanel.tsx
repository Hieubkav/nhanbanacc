"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePreviewThumb } from "./ImagePreviewThumb";
import ImageLibraryPicker from "./ImageLibraryPicker";
import { toast } from "sonner";

export default function ProductImagesPanel({ productId }: { productId: string }) {
  // Current product images
  const [imgPage] = useState(1);
  const [imgPageSize] = useState(100);
  const imgSort = useMemo(() => ({ field: "sortOrder", direction: "asc" as const }), []);
  const data = useQuery(api.product_images.listByProduct, { productId: productId as any, page: imgPage, pageSize: imgPageSize, sort: imgSort } as any);
  const items = data?.items ?? [];

  const create = useMutation(api.product_images.create);
  const remove = useMutation(api.product_images.deleteOne);
  const reorder = useMutation(api.product_images.reorder);

  // Library or Upload tabs
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [libOpen, setLibOpen] = useState(false);

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
    // Prevent duplicates
    const existing = new Set((items ?? []).map((it: any) => String(it.imageId)));
    const toAdd = ids.filter((id) => !existing.has(String(id)));
    if (toAdd.length === 0) { toast.info("Tất cả ảnh đã có trong sản phẩm"); return; }
    let base = items.length > 0 ? (items[items.length - 1].sortOrder ?? items.length) : 0;
    for (const id of toAdd) {
      base += 1;
      await create({ dto: { productId: productId as any, imageId: id as any, sortOrder: base } as any } as any);
    }
    toast.success(`Đã thêm ${toAdd.length} ảnh vào sản phẩm`);
    clearSelected();
  };

  // Upload state
  const [files, setFiles] = useState<File[]>([]);
  const [upTitle, setUpTitle] = useState("");
  const [upAlt, setUpAlt] = useState("");
  const [upVisible, setUpVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => setFiles(Array.from(e.target.files ?? []));

  const uploadAndAttach = async () => {
    try {
      if (files.length === 0) { toast.error("Vui lòng chọn ít nhất 1 ảnh"); return; }
      setUploading(true);
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      if (upTitle) fd.append("title", upTitle);
      if (upAlt) fd.append("alt", upAlt);
      fd.append("sortOrder", String(((items?.length ?? 0) + 1)));
      fd.append("isVisible", String(upVisible));
      const r = await fetch("/api/images/upload", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
      const created: string[] = (json?.results ?? []).filter((x: any) => x.ok && x.id).map((x: any) => String(x.id));
      if (created.length === 0) { toast.error("Tải ảnh không thành công"); return; }
      // Attach to product in order
      let base = items.length > 0 ? (items[items.length - 1].sortOrder ?? items.length) : 0;
      for (const id of created) {
        base += 1;
        await create({ dto: { productId: productId as any, imageId: id as any, sortOrder: base } as any } as any);
      }
      toast.success(`Đã tải và thêm ${created.length}/${files.length} ảnh`);
      setFiles([]); setUpTitle(""); setUpAlt("");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!items.length) return;
    const idx = items.findIndex((x: any) => String(x._id) === String(id));
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const beforeId = dir === -1 ? items[targetIdx]._id : undefined;
    const afterId = dir === 1 ? items[targetIdx]._id : undefined;
    await reorder({ id: id as any, beforeId: beforeId as any, afterId: afterId as any, productScopeId: productId as any } as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ảnh sản phẩm</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setLibOpen(true)}>Chọn từ thư viện</Button>
        <Button type="button" variant={tab === "upload" ? "default" : "outline"} onClick={() => setTab("upload")}>Tải ảnh lên</Button>
      </div>
      
      {tab === "upload" ? (
        <div className="space-y-3 rounded-md border p-3">
          <div className="grid gap-2">
            <Label>Chọn ảnh (có thể chọn nhiều)</Label>
            <Input type="file" multiple accept="image/*" onChange={onFilesChange} />
            {files.length > 0 && (
              <div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((f, i) => (
                  <div key={i} className="rounded-md border p-2 text-xs">
                    <div className="truncate font-medium" title={f.name}>{f.name}</div>
                    <div className="text-muted-foreground">{(f.size/1024).toFixed(1)} KB</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label>Tiêu đề (áp dụng cho tất cả)</Label>
              <Input value={upTitle} onChange={(e) => setUpTitle(e.target.value)} placeholder="Tuỳ chọn" />
            </div>
            <div className="grid gap-1">
              <Label>Alt (áp dụng cho tất cả)</Label>
              <Input value={upAlt} onChange={(e) => setUpAlt(e.target.value)} placeholder="Văn bản thay thế" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="upVisible" type="checkbox" className="h-4 w-4" checked={upVisible} onChange={(e) => setUpVisible(e.target.checked)} />
            <Label htmlFor="upVisible">Hiển thị</Label>
          </div>
          <div>
            <Button type="button" onClick={uploadAndAttach} disabled={uploading}>{uploading ? "Đang tải..." : "Tải lên và thêm vào sản phẩm"}</Button>
          </div>
        </div>
      ) : null}

      {/* Current Product Images List */}
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
              <tr><td className="p-3" colSpan={4}>Chưa có ảnh trong sản phẩm</td></tr>
            ) : (
              items.map((row: any, idx: number) => (
                <tr key={String(row._id)} className="border-t">
                  <td className="p-2">
                    <ImagePreviewThumb id={row.imageId} />
                  </td>
                  <td className="p-2 align-top">
                    <code className="text-xs">{String(row.imageId)}</code>
                  </td>
                  <td className="p-2 align-top">{row.sortOrder ?? idx + 1}</td>
                  <td className="p-2 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => move(String(row._id), -1)}>Lên</Button>
                      <Button size="sm" variant="outline" disabled={idx === items.length - 1} onClick={() => move(String(row._id), 1)}>Xuống</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove({ id: row._id as any } as any)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ImageLibraryPicker
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onConfirm={async (ids) => {
          // Attach all selected ids avoiding duplicates
          const existing = new Set((items ?? []).map((it: any) => String(it.imageId)));
          const toAdd = ids.filter((id) => !existing.has(String(id)));
          let base = items.length > 0 ? (items[items.length - 1].sortOrder ?? items.length) : 0;
          for (const id of toAdd) {
            base += 1;
            await create({ dto: { productId: productId as any, imageId: id as any, sortOrder: base } as any } as any);
          }
          setLibOpen(false);
          if (toAdd.length) toast.success(`Đã thêm ${toAdd.length} ảnh vào sản phẩm`);
        }}
      />
    </div>
  );
}
