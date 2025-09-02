"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  const existing = useQuery(isEdit ? mod.getById : undefined, isEdit ? { id } : "skip");

  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => {
    if (existing) {
      const copy = { ...existing } as any;
      delete copy._id; delete copy._creationTime;
      setForm(copy);
    }
  }, [existing]);

  const create = useMutation(mod.create);
  const update = useMutation(mod.update);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await update({ id, patch: form });
    } else {
      await create({ dto: form });
    }
    router.push(`/dashboard/resources/${resource}`);
  };

  if (!config) return <div>Resource không tồn tại</div>;

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {fields.map((f) => (
        <div key={f.name} className="grid gap-2">
          <Label>{f.label}</Label>
          <FieldControl resource={resource} field={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
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
      const suggest = useQuery(fkMod.suggest, q ? { q, limit: 8 } : undefined);
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

