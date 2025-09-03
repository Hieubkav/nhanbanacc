import { v } from "convex/values";

export const listArgsValidator = {
  q: v.optional(v.string()),
  filters: v.optional(
    v.array(
      v.object({
        field: v.string(),
        op: v.optional(v.string()), // eq | ne | gt | gte | lt | lte | in | contains | startsWith | endsWith
        value: v.any(),
      }),
    ),
  ),
  sort: v.optional(
    v.object({
      field: v.string(),
      direction: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    }),
  ),
  page: v.optional(v.number()),
  pageSize: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

export type Filter = { field: string; op?: string; value: any };
export type Sort = { field: string; direction?: "asc" | "desc" };
export type ListArgs = {
  q?: string;
  filters?: Filter[];
  sort?: Sort;
  page?: number;
  pageSize?: number;
  cursor?: string;
};

export function now() {
  return Date.now();
}

export function lc(obj: any): any {
  if (typeof obj === "string") return obj.toLowerCase();
  return obj;
}

export function matchQ(doc: any, q: string | undefined, fields: string[]) {
  if (!q) return true;
  const s = q.toLowerCase();
  for (const f of fields) {
    const val = doc?.[f];
    if (typeof val === "string" && val.toLowerCase().includes(s)) return true;
  }
  return false;
}

export function matchFilter(doc: any, f: Filter): boolean {
  const { field, op = "eq", value } = f;
  const vdoc = doc?.[field];
  switch (op) {
    case "eq":
      return vdoc === value;
    case "ne":
      return vdoc !== value;
    case "gt":
      return vdoc > value;
    case "gte":
      return vdoc >= value;
    case "lt":
      return vdoc < value;
    case "lte":
      return vdoc <= value;
    case "in":
      return Array.isArray(value) ? value.includes(vdoc) : false;
    case "contains":
      if (typeof vdoc === "string" && typeof value === "string") {
        return vdoc.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(vdoc)) return vdoc.includes(value);
      return false;
    case "startsWith":
      return typeof vdoc === "string" && typeof value === "string"
        ? vdoc.toLowerCase().startsWith(value.toLowerCase())
        : false;
    case "endsWith":
      return typeof vdoc === "string" && typeof value === "string"
        ? vdoc.toLowerCase().endsWith(value.toLowerCase())
        : false;
    default:
      return true;
  }
}

export function applyFilters(items: any[], filters?: Filter[]) {
  if (!filters || filters.length === 0) return items;
  return items.filter((doc) => filters.every((f) => matchFilter(doc, f)));
}

export function applySort(items: any[], sort?: Sort) {
  if (!sort || !sort.field) return items;
  const dir = sort.direction === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const av = a?.[sort.field];
    const bv = b?.[sort.field];
    if (av === bv) return 0;
    if (av === undefined) return -1 * dir;
    if (bv === undefined) return 1 * dir;
    return av > bv ? dir : -dir;
  });
}

export function paginate(
  items: any[],
  page?: number,
  pageSize?: number,
  cursor?: string,
) {
  const total = items.length;
  const size = Math.max(1, pageSize ?? 20);
  let offset = 0;
  if (cursor) {
    try {
      const decoded = (() => { try { const g:any = globalThis as any; if (typeof g.atob === "function") { return JSON.parse(g.atob(cursor)); } if (typeof g.Buffer !== "undefined") { return JSON.parse(g.Buffer.from(cursor, "base64").toString("utf8")); } } catch {} return {}; })();
      if (decoded && typeof decoded.o === "number") offset = decoded.o;
    } catch {}
  } else if (page && page > 1) {
    offset = (page - 1) * size;
  }
  const slice = items.slice(offset, offset + size);
  const nextOffset = offset + slice.length;
  const hasMore = nextOffset < total;
  const nextCursor = hasMore
    ? (() => { const payload = JSON.stringify({ o: nextOffset }); const g:any = globalThis as any; if (typeof g.btoa === "function") return g.btoa(payload); if (typeof g.Buffer !== "undefined") return g.Buffer.from(payload).toString("base64"); return undefined; })()
    : undefined;
  const currentPage = Math.floor(offset / size) + 1;
  return {
    items: slice,
    total,
    page: currentPage,
    pageSize: size,
    hasMore,
    nextCursor,
  };
}

export function selectLabel(doc: any, fields: string[]) {
  for (const f of fields) {
    const v = doc?.[f];
    if (typeof v === "string" && v.trim()) return v as string;
  }
  return String(doc?._id ?? "");
}

export async function findByField(
  ctx: any,
  table: string,
  field: string,
  value: any,
  excludeId?: string,
) {
  const q = ctx.db
    .query(table)
    .filter((q: any) => q.eq(q.field(field), value));
  const doc = await q.first();
  if (!doc) return null;
  if (excludeId && String(doc._id) === String(excludeId)) return null;
  return doc;
}

export async function ensureUnique(
  ctx: any,
  table: string,
  fields: string[],
  data: any,
  excludeId?: string,
) {
  for (const f of fields) {
    if (data[f] === undefined) continue;
    const exists = await findByField(ctx, table, f, data[f], excludeId);
    if (exists) {
      throw new Error(`Giá trị '${f}' đã tồn tại: ${data[f]}`);
    }
  }
}

export async function generateUniqueValue(
  ctx: any,
  table: string,
  field: string,
  base: string,
) {
  let candidate = base;
  let i = 1;
  while (await findByField(ctx, table, field, candidate)) {
    candidate = `${base}-copy${i > 1 ? `-${i}` : ""}`;
    i++;
  }
  return candidate;
}

// Reorder helper: reassign sortOrder in steps of 10
export async function reorderByIndex(
  ctx: any,
  table: string,
  id: any,
  opts: { toIndex?: number; beforeId?: any; afterId?: any; scope?: { field: string; value: any } },
) {
  const all = await ctx.db.query(table).collect();
  let items = all;
  if (opts.scope) {
    items = items.filter((d: any) => d?.[opts.scope!.field] === opts.scope!.value);
  }
  if (items.length === 0) return { success: true };
  const targetIndex = (() => {
    if (opts.toIndex !== undefined) return Math.max(0, Math.min(items.length - 1, opts.toIndex!));
    if (opts.beforeId) {
      const idx = items.findIndex((d: any) => String(d._id) === String(opts.beforeId));
      return idx >= 0 ? idx : items.length - 1;
    }
    if (opts.afterId) {
      const idx = items.findIndex((d: any) => String(d._id) === String(opts.afterId));
      return idx >= 0 ? Math.min(items.length - 1, idx + 1) : items.length - 1;
    }
    return items.length - 1;
  })();

  items.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const movingIndex = items.findIndex((d: any) => String(d._id) === String(id));
  if (movingIndex < 0) throw new Error("Item không tồn tại trong scope");
  const moving = items.splice(movingIndex, 1)[0];
  items.splice(targetIndex, 0, moving);

  // reassign sortOrder
  let changed = 0;
  for (let i = 0; i < items.length; i++) {
    const desired = (i + 1) * 10;
    if (items[i].sortOrder !== desired) {
      await ctx.db.patch(items[i]._id, { sortOrder: desired });
      changed++;
    }
  }
  return { success: true, changed };
}

export function buildSuggest(items: any[], q: string, labelFields: string[], limit = 10) {
  const s = q.toLowerCase();
  const matched = items.filter((d) =>
    labelFields.some((f) =>
      typeof d?.[f] === "string" && (d[f] as string).toLowerCase().includes(s),
    ),
  );
  return matched.slice(0, limit).map((d) => ({ id: d._id, label: selectLabel(d, labelFields) }));
}

export function onlyBooleanToggle(allowed: string[], field: string) {
  if (!allowed.includes(field)) {
    throw new Error(`Không hỗ trợ toggle cho trường '${field}'.`);
  }
}



