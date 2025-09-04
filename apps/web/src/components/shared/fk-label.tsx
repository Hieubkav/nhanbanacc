"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { apiOf } from "@/config/resources";

type Props = {
  resource: string;
  id?: any;
  labelFields?: string[];
  fallbackId?: boolean; // nếu không tìm được label thì hiện id
  className?: string;
};

export default function FkLabel({ resource, id, labelFields, fallbackId, className }: Props) {
  const mod = apiOf(resource);
  const data = useQuery(mod.getById, id ? ({ id } as any) : (undefined as any));

  const label = useMemo(() => {
    if (!data) return undefined;
    const doc: any = data;
    const fields = (labelFields && labelFields.length ? labelFields : [
      "name",
      "title",
      "email",
      "slug",
    ]) as string[];
    for (const f of fields) {
      if (doc?.[f]) return String(doc[f]);
    }
    // fallback ghép vài field nếu có
    const parts = fields.map((f) => doc?.[f]).filter(Boolean);
    return parts.length ? parts.join(" - ") : undefined;
  }, [data, labelFields]);

  if (!id) return <span className="text-muted-foreground">-</span>;
  if (data === undefined) return <span className="text-muted-foreground">...</span>;
  if (label) return <span className={className}>{label}</span>;
  return <span className={className}>{fallbackId ? String(id) : "-"}</span>;
}

