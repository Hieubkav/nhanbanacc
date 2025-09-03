"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { RESOURCES_MAP, apiOf, type FieldConfig } from "@/config/resources";
import { useRouter } from "next/navigation";
import { ImagePreviewThumb } from "./ImagePreviewThumb";
import RichTextEditor from "./RichTextEditor";

const SETTINGS_SELECTS: Record<string, { label: string; value: string }[]> = {
  type: [
    { label: "string", value: "string" },
    { label: "number", value: "number" },
    { label: "boolean", value: "boolean" },
    { label: "json", value: "json" },
    { label: "url", value: "url" },
    { label: "email", value: "email" },
    { label: "phone", value: "phone" },
    { label: "color", value: "color" },
    { label: "imageId", value: "imageId" },
    { label: "richtext", value: "richtext" },
  ],
  group: [
    { label: "site", value: "site" },
    { label: "seo", value: "seo" },
    { label: "social", value: "social" },
    { label: "ui", value: "ui" },
    { label: "feature", value: "feature" },
    { label: "contact", value: "contact" },
  ],
};

const SETTINGS_HELP: Record<string, string> = {
  key: "Định danh duy nhất (nên dạng namespace.key). Dùng để đọc ở frontend.",
  value: "Giá trị chính. Với kiểu phức tạp có thể nhập JSON.",
  group: "Nhóm/namespace của cấu hình (site, seo, social, ui, feature, contact).",
  label: "Tên hiển thị trong trang quản trị để người dùng dễ hiểu.",
  description: "Ghi chú/giải thích ngắn mục đích cấu hình.",
  type: "Kiểu dữ liệu của Value để parse đúng.",
};

function exampleForKeyByGroup(group?: string) {
  switch ((group ?? "").toLowerCase()) {
    case "seo":
      return "seo.defaultTitle";
    case "social":
      return "social.facebook";
    case "ui":
      return "ui.primaryColor";
    case "feature":
      return "feature.enableWishlist";
    case "contact":
      return "contact.phone";
    case "site":
    default:
      return "site.name";
  }
}

function exampleForValueByType(type?: string) {
  switch ((type ?? "string").toLowerCase()) {
    case "number":
      return "42";
    case "boolean":
      return "true";
    case "json":
      return '{"en":"Title","vi":"Tiêu đề"}';
    case "url":
      return "https://example.com";
    case "email":
      return "hello@example.com";
    case "phone":
      return "0909123456";
    case "color":
      return "#0ea5e9";
    case "imageId":
      return "<id_ảnh_từ_Images>";
    case "richtext":
      return "<p>Nội dung...</p>";
    case "string":
    default:
      return "Công ty ABC";
  }
}

const SETTINGS_EXAMPLE: Record<string, (form: Record<string, any>) => string | undefined> = {
  key: (form) => exampleForKeyByGroup(form.group),
  value: (form) => exampleForValueByType(form.type),
  group: () => "site",
  label: (form) => (form.group === "seo" ? "Tiêu đề mặc định" : "Tên website"),
  description: (form) => (form.group === "seo" ? "Dùng cho thẻ title" : "Hiển thị ở header"),
  type: (form) => (form.key?.endsWith("Color") ? "color" : "string"),
};

type Props = {
  resource: string;
  id?: string; // nếu có là edit form
};

export default function ResourceForm({ resource, id }: Props) {
  const router = useRouter();
  const config = RESOURCES_MAP[resource];
  const mod = apiOf(resource);
  const isEdit = !!id;
  let fields = (config.editFields ?? config.createFields) as FieldConfig[];
  // Với images, không yêu cầu URL, ưu tiên storageId
  if (resource === "images") {
    fields = fields.filter((f) => !["url", "size", "mimeType"].includes(f.name));
  }

  // Luôn truyền hàm query hợp lệ; dùng args = undefined để skip khi tạo mới
  const convex = useConvex();
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(!!id);
  // Prefetch dữ liệu khi edit bằng gọi trực tiếp qua convex.query để tránh lỗi validate args khi tạo mới
  useEffect(() => {
    if (!isEdit || !id) return;
    let mounted = true;
    convex.query(apiOf(resource).getById, { id } as any).then((doc: any) => {
      if (!mounted || !doc) return;
      const copy = { ...doc } as any;
      delete copy._id; delete copy._creationTime;
      setForm(copy);
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [convex, isEdit, id, resource]);

  const create = useMutation(mod.create);
  const update = useMutation(mod.update);

  // Set default values when creating new
  useEffect(() => {
    if (isEdit) return;
    setForm((s) => {
      const next: any = { ...s };
      if (fields.some((f) => f.name === "sortOrder") && (next.sortOrder === undefined || next.sortOrder === null || next.sortOrder === "")) {
        next.sortOrder = 1;
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chỉ pick các field được khai báo trong cấu hình để tránh gửi thừa (vd: createdAt, updatedAt)
      const dto: Record<string, any> = {};
      for (const f of fields) {
        const v = (form as any)[f.name];
        if (v !== undefined) dto[f.name] = v;
      }
      // Auto-generate slug nếu có field slug và đang trống
      if (fields.some((f) => f.name === "slug")) {
        const hasSlug = typeof dto.slug === "string" && String(dto.slug).trim() !== "";
        const baseName = (dto as any).name ?? (form as any).name ?? (dto as any).title ?? (form as any).title;
        if (!hasSlug && baseName) dto.slug = slugify(String(baseName));
      }

      // Validate required fields
      const missing: string[] = [];
      for (const f of fields) {
        if (!f.required) continue;
        const v = dto[f.name];
        const isMissing =
          f.type === "number" ? v === undefined || v === null || Number.isNaN(v) :
          f.type === "boolean" ? v === undefined || v === null :
          v === undefined || v === null || String(v).trim() === "";
        if (isMissing) missing.push(f.label);
      }
      if (missing.length) {
        toast.error(`Thiếu trường bắt buộc: ${missing.join(", ")}`);
        return;
      }

      if (isEdit) {
        await update({ id, patch: dto });
      } else {
        await create({ dto });
      }
      router.push(`/dashboard/resources/${resource}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi khi lưu dữ liệu");
    }
  };

  if (!config) return <div>Resource không tồn tại</div>;

  if (isEdit && loading) {
    return <div className="p-2 text-sm text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {fields.map((f) => (
        <div key={f.name} className="grid gap-2">
          <Label>{f.label}</Label>
          <FieldControl
            resource={resource}
            field={f}
            value={form[f.name]}
            form={form}
            onChange={(v) =>
              setForm((s) => {
                const next: any = { ...s, [f.name]: v };
                // T? ??ng c?p nh?t slug theo name cho ??n khi user t?nh s?a slug
                if (
                  (f.name === "name" || f.name === "title") &&
                  fields.some((x) => x.name === "slug")
                ) {
                  const prevAuto = slugify(String(s.name ?? s.title ?? ""));
                  const slugEmpty = !s.slug || String(s.slug).trim() === "";
                  const slugWasAuto = s.slug === prevAuto;
                  if (slugEmpty || slugWasAuto) {
                    next.slug = slugify(String(v ?? ""));
                  }
                }
                return next;
              })
            }
          />
          {(() => {
            const help = (f as any).help ?? (resource === "settings" ? SETTINGS_HELP[f.name] : undefined);
            const example = resource === "settings" ? SETTINGS_EXAMPLE[f.name]?.(form) : undefined;
            if (!help && !example) return null;
            return (
              <p className="text-xs text-muted-foreground">
                {help}
                {example ? <span className="block">Ví dụ: {example}</span> : null}
              </p>
            );
          })()}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button type="submit">{isEdit ? "Lưu" : "Tạo"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
      </div>
    </form>
  );
}

function FieldControl({ resource, field, value, onChange, form }: { resource: string; field: FieldConfig; value: any; onChange: (v: any) => void; form?: any }) {
  const mod = apiOf(resource);
  // Override cho resource 'settings' để hiển thị dropdown cho type và group
  if (resource === "settings" && (field.name === "type" || field.name === "group")) {
    const opts = SETTINGS_SELECTS[field.name] ?? [];
    return (
      <select
        className="h-9 rounded-md border bg-background px-3"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Chọn --</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  if (resource === "settings" && field.name === "value") {
    const dynamicPlaceholder = exampleForValueByType(form?.type);
    return <Input value={value ?? ""} placeholder={dynamicPlaceholder} onChange={(e) => onChange(e.target.value)} />;
  }
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
      const [open, setOpen] = useState(false);
      const suggest = useQuery(fkMod.suggest, { q: q ?? "", limit: 8 });
      return (
        <div className="relative space-y-2 group">
          {field.fk!.resource === "images" && (
            <div className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <ImagePreviewThumb id={value} size={56} />
              <div className="text-xs text-muted-foreground min-w-0">
                {value ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate">ID: {String(value)}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => onChange(undefined)}>Bỏ chọn</Button>
                    <a href="/dashboard/resources/images/new" target="_blank" className="text-xs underline">Tải ảnh mới</a>
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

