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

type Props = {
  resource: string;
  id?: string; // nếu có là edit form
};

export default function ResourceForm({ resource, id }: Props) {
  const router = useRouter();
  const config = RESOURCES_MAP[resource];
  const mod = apiOf(resource);
  const isEdit = !!id;
  const fields = (config.editFields ?? config.createFields) as FieldConfig[];

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
        const baseName = (dto as any).name ?? (form as any).name;
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
            onChange={(v) =>
              setForm((s) => {
                const next: any = { ...s, [f.name]: v };
                // T? ??ng c?p nh?t slug theo name cho ??n khi user t?nh s?a slug
                if (
                  f.name === "name" &&
                  fields.some((x) => x.name === "slug")
                ) {
                  const prevAuto = slugify(String(s.name ?? ""));
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
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button type="submit">{isEdit ? "Lưu" : "Tạo"}</Button>
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
      return <textarea value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="min-h-[100px] rounded-md border bg-background px-3 py-2" />;
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
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "fk": {
      const fkMod = apiOf(field.fk!.resource);
      const [q, setQ] = useState("");
      const suggest = useQuery(fkMod.suggest, { q: q ?? "", limit: 8 });
      return (
        <div className="relative">
          <Input value={q} placeholder={`Tìm ${field.label.toLowerCase()}...`} onChange={(e) => setQ(e.target.value)} />
          {suggest && suggest.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow">
              {suggest.map((s: any) => (
                <button type="button" key={String(s.id)} className="w-full rounded-sm px-2 py-1 text-left hover:bg-accent" onClick={() => { onChange(s.id); setQ(s.label); }}>
                  {s.label}
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
