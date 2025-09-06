import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  listArgsValidator,
  applyFilters,
  applySort,
  paginate,
  matchQ,
  ensureUnique,
  findByField,
  buildSuggest,
  now,
  onlyBooleanToggle,
  reorderByIndex,
} from "./lib/crud";

const TABLE = "service_websites" as const;
const SEARCH_FIELDS = [
  "title",
  "summary",
  "description",
  "websiteUrl",
  "clientName",
] as const;
const LABEL_FIELDS = ["title", "clientName"] as const;
const TOGGLE_FIELDS = ["isVisible", "isPriceVisible"] as const;

export const getById = query({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getManyByIds = query({
  args: { ids: v.array(v.id(TABLE)) },
  handler: async (ctx, { ids }) => {
    const results = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return results.filter(Boolean);
  },
});

export const list = query({
  args: listArgsValidator,
  handler: async (ctx, args) => {
    const docs = await ctx.db.query(TABLE).collect();
    let items = docs.filter((d) => matchQ(d, args.q, [...SEARCH_FIELDS] as any));
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
  },
});

export const exists = query({
  args: { field: v.string(), value: v.any(), excludeId: v.optional(v.id(TABLE)) },
  handler: async (ctx, { field, value, excludeId }) => {
    const doc = await findByField(ctx, TABLE, field, value, excludeId);
    return { exists: !!doc };
  },
});

export const count = query({
  args: { q: v.optional(v.string()), filters: listArgsValidator.filters! },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query(TABLE).collect();
    const items = applyFilters(
      docs.filter((d) => matchQ(d, args.q, [...SEARCH_FIELDS] as any)),
      args.filters,
    );
    return { total: items.length };
  },
});

export const suggest = query({
  args: { q: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { q, limit }) => {
    const docs = await ctx.db.query(TABLE).collect();
    return buildSuggest(docs, q, [...LABEL_FIELDS] as any, limit ?? 10);
  },
});

export const create = mutation({
  args: {
    dto: v.object({
      title: v.string(),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.boolean(),
      sortOrder: v.number(),
      price: v.optional(v.number()),
      isPriceVisible: v.boolean(),
    }),
  },
  handler: async (ctx, { dto }) => {
    const nowTs = now();
    const id = await ctx.db.insert(TABLE, { ...dto, createdAt: nowTs, updatedAt: nowTs });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id(TABLE),
    patch: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
      price: v.optional(v.number()),
      isPriceVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, { ...patch, updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const guardedUpdate = mutation({
  args: {
    id: v.id(TABLE),
    expectedUpdatedAt: v.number(),
    patch: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
      price: v.optional(v.number()),
      isPriceVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, expectedUpdatedAt, patch }) => {
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Không tìm thấy bản ghi");
    if (current.updatedAt !== expectedUpdatedAt) throw new Error("Bản ghi đã bị cập nhật bởi phiên khác");
    await ctx.db.patch(id, { ...patch, updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const deleteOne = mutation({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const bulkUpdate = mutation({
  args: {
    ids: v.array(v.id(TABLE)),
    patch: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
      price: v.optional(v.number()),
      isPriceVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { ids, patch }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { ...patch, updatedAt: now() });
    }
    return { success: true, count: ids.length };
  },
});

export const bulkDelete = mutation({
  args: { ids: v.array(v.id(TABLE)) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) await ctx.db.delete(id);
    return { success: true, count: ids.length };
  },
});

export const toggle = mutation({
  args: { id: v.id(TABLE), field: v.string() },
  handler: async (ctx, { id, field }) => {
    onlyBooleanToggle([...TOGGLE_FIELDS] as any, field);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Không tìm thấy bản ghi");
    const val = !!(doc as any)[field];
    await ctx.db.patch(id, { [field]: !val, updatedAt: now() } as any);
    return ctx.db.get(id);
  },
});

export const reorder = mutation({
  args: { id: v.id(TABLE), toIndex: v.optional(v.number()), beforeId: v.optional(v.id(TABLE)), afterId: v.optional(v.id(TABLE)) },
  handler: async (ctx, args) => {
    return reorderByIndex(ctx, TABLE, args.id, {
      toIndex: args.toIndex,
      beforeId: args.beforeId,
      afterId: args.afterId,
    } as any);
  },
});

export const publish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("service_websites không có status"); } });
export const unpublish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("service_websites không có status"); } });

export const clone = mutation({
  args: { id: v.id(TABLE), overrides: v.optional(v.object({
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    clientName: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    price: v.optional(v.number()),
    isPriceVisible: v.optional(v.boolean()),
  })) },
  handler: async (ctx, { id, overrides }) => {
    const src = await ctx.db.get(id);
    if (!src) throw new Error("Không tìm thấy bản ghi để clone");
    const nowTs = now();
    const dto = {
      title: overrides?.title ?? (src as any).title,
      summary: overrides?.summary ?? (src as any).summary,
      description: overrides?.description ?? (src as any).description,
      websiteUrl: overrides?.websiteUrl ?? (src as any).websiteUrl,
      clientName: overrides?.clientName ?? (src as any).clientName,
      isVisible: overrides?.isVisible ?? (src as any).isVisible,
      sortOrder: overrides?.sortOrder ?? (src as any).sortOrder,
      price: overrides?.price ?? (src as any).price,
      isPriceVisible: overrides?.isPriceVisible ?? (src as any).isPriceVisible,
      createdAt: nowTs,
      updatedAt: nowTs,
    };
    const newId = await ctx.db.insert(TABLE, dto as any);
    return ctx.db.get(newId);
  },
});

export const upsert = mutation({
  args: {
    where: v.object({ field: v.string(), value: v.any() }),
    create: v.object({
      title: v.string(),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.boolean(),
      sortOrder: v.number(),
      price: v.optional(v.number()),
      isPriceVisible: v.boolean(),
    }),
    update: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      clientName: v.optional(v.string()),
      isVisible: v.optional(v.boolean()),
      sortOrder: v.optional(v.number()),
      price: v.optional(v.number()),
      isPriceVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { where, create, update }) => {
    const found = await findByField(ctx, TABLE, where.field, where.value);
    if (!found) {
      const nowTs = now();
      const id = await ctx.db.insert(TABLE, { ...create, createdAt: nowTs, updatedAt: nowTs });
      return ctx.db.get(id);
    }
    await ctx.db.patch(found._id, { ...update, updatedAt: now() } as any);
    return ctx.db.get(found._id);
  },
});

