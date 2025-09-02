import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  listArgsValidator,
  applyFilters,
  applySort,
  paginate,
  matchQ,
  findByField,
  now,
  reorderByIndex,
} from "./lib/crud";

const TABLE = "product_images" as const;
const SEARCH_FIELDS: readonly string[] = [];

export const getById = query({ args: { id: v.id(TABLE) }, handler: async (ctx, { id }) => ctx.db.get(id) });
export const getManyByIds = query({
  args: { ids: v.array(v.id(TABLE)) },
  handler: async (ctx, { ids }) => (await Promise.all(ids.map((id) => ctx.db.get(id)))).filter(Boolean),
});

export const list = query({
  args: listArgsValidator,
  handler: async (ctx, args) => {
    const docs = await ctx.db.query(TABLE).collect();
    let items = SEARCH_FIELDS.length ? docs.filter((d) => matchQ(d, args.q, SEARCH_FIELDS as any)) : docs;
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
  },
});

export const listByProduct = query({
  args: { productId: v.id("products"), ...listArgsValidator },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query(TABLE)
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .collect();
    let items = docs;
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
  },
});

export const listByImage = query({
  args: { imageId: v.id("images"), ...listArgsValidator },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query(TABLE)
      .filter((q) => q.eq(q.field("imageId"), args.imageId))
      .collect();
    let items = docs;
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
  },
});

export const exists = query({
  args: { field: v.string(), value: v.any(), excludeId: v.optional(v.id(TABLE)) },
  handler: async (ctx, { field, value, excludeId }) => ({
    exists: !!(await findByField(ctx, TABLE, field, value, excludeId)),
  }),
});

export const count = query({
  args: { q: v.optional(v.string()), filters: listArgsValidator.filters! },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query(TABLE).collect();
    const items = applyFilters(docs, args.filters);
    return { total: items.length };
  },
});

export const create = mutation({
  args: { dto: v.object({ productId: v.id("products"), imageId: v.id("images"), sortOrder: v.number() }) },
  handler: async (ctx, { dto }) => {
    const id = await ctx.db.insert(TABLE, { ...dto, createdAt: now() });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id(TABLE),
    patch: v.object({ productId: v.optional(v.id("products")), imageId: v.optional(v.id("images")), sortOrder: v.optional(v.number()) }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch as any);
    return ctx.db.get(id);
  },
});

export const guardedUpdate = mutation({
  args: { id: v.id(TABLE), expectedUpdatedAt: v.number(), patch: v.object({}) },
  handler: async () => {
    throw new Error("product_images không có updatedAt nên không hỗ trợ guardedUpdate");
  },
});

export const deleteOne = mutation({ args: { id: v.id(TABLE) }, handler: async (ctx, { id }) => { await ctx.db.delete(id); return { success: true }; } });
export const bulkDelete = mutation({ args: { ids: v.array(v.id(TABLE)) }, handler: async (ctx, { ids }) => { for (const id of ids) await ctx.db.delete(id); return { success: true, count: ids.length }; } });

export const bulkUpdate = mutation({
  args: { ids: v.array(v.id(TABLE)), patch: v.object({ productId: v.optional(v.id("products")), imageId: v.optional(v.id("images")), sortOrder: v.optional(v.number()) }) },
  handler: async (ctx, { ids, patch }) => { for (const id of ids) await ctx.db.patch(id, patch as any); return { success: true, count: ids.length }; },
});

export const toggle = mutation({ args: { id: v.id(TABLE), field: v.string() }, handler: async () => { throw new Error("product_images không có boolean để toggle"); } });

export const reorder = mutation({
  args: { id: v.id(TABLE), toIndex: v.optional(v.number()), beforeId: v.optional(v.id(TABLE)), afterId: v.optional(v.id(TABLE)), productScopeId: v.optional(v.id("products")) },
  handler: async (ctx, args) => reorderByIndex(ctx, TABLE, args.id, { toIndex: args.toIndex, beforeId: args.beforeId, afterId: args.afterId, scope: args.productScopeId ? { field: "productId", value: args.productScopeId } : undefined } as any),
});

export const publish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("product_images không có status"); } });
export const unpublish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("product_images không có status"); } });

export const clone = mutation({
  args: { id: v.id(TABLE), overrides: v.optional(v.object({ productId: v.optional(v.id("products")), imageId: v.optional(v.id("images")), sortOrder: v.optional(v.number()) })) },
  handler: async (ctx, { id, overrides }) => {
    const src = await ctx.db.get(id);
    if (!src) throw new Error("Không tìm thấy bản ghi để clone");
    const dto = { productId: overrides?.productId ?? src.productId, imageId: overrides?.imageId ?? src.imageId, sortOrder: overrides?.sortOrder ?? src.sortOrder, createdAt: now() } as any;
    const newId = await ctx.db.insert(TABLE, dto);
    return ctx.db.get(newId);
  },
});

export const upsert = mutation({
  args: {
    where: v.object({ field: v.string(), value: v.any() }),
    create: v.object({ productId: v.id("products"), imageId: v.id("images"), sortOrder: v.number() }),
    update: v.object({ productId: v.optional(v.id("products")), imageId: v.optional(v.id("images")), sortOrder: v.optional(v.number()) }),
  },
  handler: async (ctx, { where, create, update }) => {
    const found = await findByField(ctx, TABLE, where.field, where.value);
    if (!found) {
      const id = await ctx.db.insert(TABLE, { ...create, createdAt: now() });
      return ctx.db.get(id);
    }
    await ctx.db.patch(found._id, update as any);
    return ctx.db.get(found._id);
  },
});

