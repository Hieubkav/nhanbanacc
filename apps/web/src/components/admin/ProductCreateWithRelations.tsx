"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { RESOURCES_MAP, apiOf, type FieldConfig } from "@/config/resources";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { ImagePreviewThumb } from "./ImagePreviewThumb";
import ImageLibraryPicker from "./ImageLibraryPicker";
import RichTextEditor from "./RichTextEditor";

export default function ProductCreateWithRelations() {
  const router = useRouter();
  const resource = "products";
  const config = RESOURCES_MAP[resource]!;
  const fields = config.createFields as FieldConfig[];

  const convex = useConvex();
  const createProduct = useMutation(api.products.create);
  const createVariant = useMutation(api.product_variants.create);
  const createProdImage = useMutation(api.product_images.create);

  const [form, setForm] = useState<Record<string, any>>({ sortOrder: 1 });

  // Draft variants
  type DraftVar = { name: string; price: string; originalPrice?: string; note?: string; isDefault?: boolean; isVisible?: boolean };
  const [variants, setVariants] = useState<DraftVar[]>([]);

  // Draft images
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [imagesTab, setImagesTab] = useState<"library" | "upload">("upload");
  const [libOpen, setLibOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadVisible, setUploadVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  const addVariant = (v: DraftVar) => {
    if (!v.name?.trim()) return;
    if (v.price === undefined || v.price === null || v.price === "") return;
    setVariants((arr) => [...arr, { name: v.name.trim(), price: String(v.price), originalPrice: v.originalPrice, note: v.note, isDefault: !!v.isDefault, isVisible: v.isVisible ?? true }]);
  };

  const removeVariant = (idx: number) => setVariants((arr) => arr.filter((_, i) => i !== idx));
  const moveVariant = (idx: number, dir: -1 | 1) => setVariants((arr) => {
    const to = idx + dir; if (to < 0 || to >= arr.length) return arr; const cp = arr.slice(); const t = cp[idx]; cp[idx] = cp[to]; cp[to] = t; return cp;
  });

  const addImage = (id: string) => setImageIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  const removeImage = (id: string) => setImageIds((ids) => ids.filter((x) => x !== id));
  const moveImage = (id: string, dir: -1 | 1) => setImageIds((ids) => {
    const idx = ids.findIndex((x) => x === id); const to = idx + dir; if (idx < 0 || to < 0 || to >= ids.length) return ids; const cp = ids.slice(); const t = cp[idx]; cp[idx] = cp[to]; cp[to] = t; return cp;
  });

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadFiles(files);
  };

  const uploadSelected = async () => {
    try {
      if (uploadFiles.length === 0) { toast.error("Vui lòng chọn ít nhất 1 ảnh"); return; }
      setUploading(true);
      const fd = new FormData();
      for (const f of uploadFiles) fd.append("files", f);
      if (uploadTitle) fd.append("title", uploadTitle);
      if (uploadAlt) fd.append("alt", uploadAlt);
      fd.append("sortOrder", String((imageIds.length || 0) + 1));
      fd.append("isVisible", String(uploadVisible));
      const r = await fetch("/api/images/upload", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok) { throw new Error(json?.error || `HTTP ${r.status}`); }
      const okItems: string[] = (json?.results ?? []).filter((x: any) => x.ok && x.id).map((x: any) => String(x.id));
      if (okItems.length) {
        setImageIds((ids) => {
          const set = new Set(ids);
          okItems.forEach((id) => set.add(id));
          return Array.from(set);
        });
        toast.success(`Đã tải ${okItems.length}/${uploadFiles.length} ảnh và thêm vào sản phẩm`);
        setUploadFiles([]);
        setUploadTitle("");
        setUploadAlt("");
      } else {
        toast.error("Tải ảnh không thành công");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gather dto like ResourceForm
      const dto: Record<string, any> = {};
      for (const f of fields) {
        const v = (form as any)[f.name];
        if (v !== undefined) dto[f.name] = v;
      }
      if (fields.some((f) => f.name === "slug")) {
        const hasSlug = typeof dto.slug === "string" && String(dto.slug).trim() !== "";
        const baseName = (dto as any).name ?? (form as any).name ?? (dto as any).title ?? (form as any).title;
        if (!hasSlug && baseName) dto.slug = slugify(String(baseName));
      }
      // Validate required
      const missing: string[] = [];
      for (const f of fields) {
        if (!f.required) continue;
        const v = dto[f.name];
        const isMissing = f.type === "number" ? v === undefined || v === null || Number.isNaN(v) : f.type === "boolean" ? v === undefined || v === null : v === undefined || v === null || String(v).trim() === "";
        if (isMissing) missing.push(f.label);
      }
      if (missing.length) { toast.error(`Thiếu trường bắt buộc: ${missing.join(", ")}`); return; }

      const product = await createProduct({ dto } as any);
      const productId = (product as any)?._id as string | undefined;
      if (!productId) throw new Error("Không lấy được ID sản phẩm");

      // Create variants
      if (variants.length > 0) {
        const hasDefault = variants.some((v) => !!v.isDefault);
        await Promise.all(
          variants.map((v, i) => createVariant({ dto: {
            productId: productId as any,
            name: v.name,
            description: undefined,
            price: Number(v.price),
            originalPrice: v.originalPrice === undefined || v.originalPrice === "" ? undefined : Number(v.originalPrice),
            note: v.note || undefined,
            isDefault: hasDefault ? !!v.isDefault : i === 0, // nếu chưa đánh dấu, set biến thể đầu làm mặc định
            sortOrder: i + 1,
            isVisible: v.isVisible ?? true,
          } as any } as any))
        );
      }

      // Create product_images
      if (imageIds.length > 0) {
        await Promise.all(imageIds.map((imgId, i) => createProdImage({ dto: { productId: productId as any, imageId: imgId as any, sortOrder: i + 1 } as any } as any)));
      }

      router.push(`/dashboard/resources/products/${productId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi khi tạo sản phẩm");
    }
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* Product basic fields */}
      <div className="grid gap-4">
        {fields.map((f) => (
          <div key={f.name} className="grid gap-2">
            <Label>{f.label}</Label>
            <FieldControl
              resource={resource}
              field={f}
              value={form[f.name]}
              onChange={(v) =>
                setForm((s) => {
                  const next: any = { ...s, [f.name]: v };
                  if ((f.name === "name" || f.name === "title") && fields.some((x) => x.name === "slug")) {
                    const prevAuto = slugify(String(s.name ?? s.title ?? ""));
                    const slugEmpty = !s.slug || String(s.slug).trim() === "";
                    const slugWasAuto = s.slug === prevAuto;
                    if (slugEmpty || slugWasAuto) next.slug = slugify(String(v ?? ""));
                  }
                  return next;
                })
              }
            />
          </div>
        ))}
      </div>

      {/* Variants draft */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Biến thể (tạo mới cùng sản phẩm)</h2>
        <VariantDraftEditor onAdd={addVariant} />
        <VariantDraftList rows={variants} onRemove={removeVariant} onMove={moveVariant} />
      </div>

      {/* Images draft */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Ảnh sản phẩm (tạo mới cùng sản phẩm)</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setLibOpen(true)}>Chọn từ thư viện</Button>
          <Button type="button" variant={imagesTab === "upload" ? "default" : "outline"} onClick={() => setImagesTab("upload")}>Tải ảnh lên</Button>
        </div>

        {imagesTab === "upload" && (
          <div className="grid gap-3 rounded-md border p-3">
            <div className="grid gap-2">
              <Label>Chọn ảnh (có thể chọn nhiều)</Label>
              <Input type="file" multiple accept="image/*" onChange={onFilesChange} />
              {uploadFiles.length > 0 && (
                <div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {uploadFiles.map((f, i) => (
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
                <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Tuỳ chọn" />
              </div>
              <div className="grid gap-1">
                <Label>Alt (áp dụng cho tất cả)</Label>
                <Input value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} placeholder="Văn bản thay thế" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="uploadVisible" type="checkbox" className="h-4 w-4" checked={uploadVisible} onChange={(e) => setUploadVisible(e.target.checked)} />
              <Label htmlFor="uploadVisible">Hiển thị</Label>
            </div>
            <div>
              <Button type="button" onClick={uploadSelected} disabled={uploading}>{uploading ? "Đang tải..." : "Tải lên và thêm vào danh sách"}</Button>
            </div>
          </div>
        )}

        <ImageDraftList imageIds={imageIds} onRemove={removeImage} onMove={moveImage} />
      </div>


      <ImageLibraryPicker
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onConfirm={(ids) => {
          setImageIds((prev) => {
            const set = new Set(prev);
            ids.forEach((id) => set.add(String(id)));
            return Array.from(set);
          });
          setLibOpen(false);
        }}
      />

      <div className="flex items-center gap-2">
        <Button type="submit">Tạo sản phẩm</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
      </div>
    </form>
  );
}

function FieldControl({ resource, field, value, onChange }: { resource: string; field: FieldConfig; value: any; onChange: (v: any) => void }) {
  const mod = apiOf(resource);
  switch (field.type) {
    case "text":
      return <Input value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      if ((resource === "posts" && field.name === "content") || (resource === "products" && field.name === "description")) {
        return (
          <div className="rounded-md border bg-background">
            <RichTextEditor value={value ?? ""} onChange={onChange} placeholder={field.placeholder ?? "Nhập nội dung..."} />
          </div>
        );
      }
      return <textarea value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="min-h-[100px] rounded-md border bg-background px-3 py-2" />;
    case "richtext":
      return (
        <div className="rounded-md border bg-background">
          <RichTextEditor value={value ?? ""} onChange={onChange} placeholder={field.placeholder ?? "Nhập nội dung..."} />
        </div>
      );
    case "number":
      return <Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />;
    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input id={field.name} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <Label htmlFor={field.name}>Bật/Tắt</Label>
        </div>
      );
    case "select":
      return (
        <select className="h-9 rounded-md border bg-background px-3" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">-- Chọn --</option>
          {(field.name === "status" ? (field.options ?? []).map((o) => ({
            ...o,
            label: o.value === "draft" ? "Nháp" : o.value === "published" ? "Xuất bản" : o.label,
          })) : (field.options ?? [])).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "fk": {
      const fkMod = apiOf(field.fk!.resource);
      const [q, setQ] = useState("");
      const suggest = useQuery(fkMod.suggest, { q: q ?? "", limit: 8 });
      return (
        <div className="relative space-y-2 group">
          {field.fk!.resource === "images" && (
            <div className="flex items-center gap-3">
              <ImagePreviewThumb id={value} size={56} />
              <div className="text-xs text-muted-foreground min-w-0">
                {value ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate">ID: {String(value)}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => onChange(undefined)}>Bỏ chọn</Button>
                  </div>
                ) : (
                  <div className="text-xs">Chưa chọn ảnh thumbnail</div>
                )}
              </div>
            </div>
          )}
          <Input value={q} placeholder={`Tìm ${field.label.toLowerCase()}...`} onChange={(e) => setQ(e.target.value)} />
          {suggest && suggest.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow hidden group-focus-within:block">
              {suggest.map((s: any) => (
                <button
                  type="button"
                  key={String(s.id)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left hover:bg-accent"
                  onMouseDown={(e) => { e.preventDefault(); onChange(s.id); setQ(s.label); }}
                >
                  {field.fk!.resource === "images" && <ImagePreviewThumb id={s.id} size={28} />}
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          )}
          {value && <div className="mt-1 text-xs text-muted-foreground">Đã chọn: {String(value)}</div>}
        </div>
      );
    }
    default:
      return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

function VariantDraftEditor({ onAdd }: { onAdd: (v: { name: string; price: string; originalPrice?: string; note?: string; isDefault?: boolean; isVisible?: boolean }) => void }) {
  const [row, setRow] = useState({ name: "", price: "", originalPrice: "", note: "", isDefault: false, isVisible: true });
  return (
    <div className="grid gap-2 rounded-md border p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <Label>Tên</Label>
          <Input value={row.name} onChange={(e) => setRow((s) => ({ ...s, name: e.target.value }))} />
        </div>
        <div>
          <Label>Giá</Label>
          <Input type="number" value={row.price} onChange={(e) => setRow((s) => ({ ...s, price: e.target.value }))} />
        </div>
        <div>
          <Label>Giá gốc</Label>
          <Input type="number" value={row.originalPrice} onChange={(e) => setRow((s) => ({ ...s, originalPrice: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <Label>Ghi chú</Label>
          <Input value={row.note} onChange={(e) => setRow((s) => ({ ...s, note: e.target.value }))} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.isDefault} onChange={(e) => setRow((s) => ({ ...s, isDefault: e.target.checked }))} /> Mặc định</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.isVisible} onChange={(e) => setRow((s) => ({ ...s, isVisible: e.target.checked }))} /> Hiển thị</label>
        <Button type="button" onClick={() => { onAdd(row as any); setRow({ name: "", price: "", originalPrice: "", note: "", isDefault: false, isVisible: true }); }}>Thêm biến thể</Button>
      </div>
    </div>
  );
}

function VariantDraftList({ rows, onRemove, onMove }: { rows: any[]; onRemove: (idx: number) => void; onMove: (idx: number, dir: -1 | 1) => void }) {
  if (!rows.length) return <div className="text-sm text-muted-foreground">Chưa có biến thể</div>;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-[800px] w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Giá</th>
            <th className="p-2 text-left">Giá gốc</th>
            <th className="p-2 text-left">Ghi chú</th>
            <th className="p-2 text-left">Mặc định</th>
            <th className="p-2 text-left">Hiển thị</th>
            <th className="p-2 text-left">Thứ tự</th>
            <th className="p-2 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.price}</td>
              <td className="p-2">{r.originalPrice || "-"}</td>
              <td className="p-2">{r.note || "-"}</td>
              <td className="p-2">{r.isDefault ? "Có" : "Không"}</td>
              <td className="p-2">{r.isVisible ? "Hiện" : "Ẩn"}</td>
              <td className="p-2">{idx + 1}</td>
              <td className="p-2">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => onMove(idx, -1)}>Lên</Button>
                  <Button size="sm" variant="outline" disabled={idx === rows.length - 1} onClick={() => onMove(idx, 1)}>Xuống</Button>
                  <Button size="sm" variant="destructive" onClick={() => onRemove(idx)}>Xoá</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageDraftList({ imageIds, onRemove, onMove }: { imageIds: string[]; onRemove: (id: string) => void; onMove: (id: string, dir: -1 | 1) => void }) {
  if (!imageIds.length) return <div className="text-sm text-muted-foreground">Chưa có ảnh</div>;
  return (
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
          {imageIds.map((id, idx) => (
            <tr key={id} className="border-t">
              <td className="p-2"><ImagePreviewThumb id={id} /></td>
              <td className="p-2"><code className="text-xs">{id}</code></td>
              <td className="p-2">{idx + 1}</td>
              <td className="p-2">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => onMove(id, -1)}>Lên</Button>
                  <Button size="sm" variant="outline" disabled={idx === imageIds.length - 1} onClick={() => onMove(id, 1)}>Xuống</Button>
                  <Button size="sm" variant="destructive" onClick={() => onRemove(id)}>Xoá</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}







