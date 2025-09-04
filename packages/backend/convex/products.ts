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

const TABLE = "products" as const;
const SEARCH_FIELDS = ["name", "slug", "description", "shortDesc", "features", "status"] as const;
const LABEL_FIELDS = ["name", "slug"] as const;
const TOGGLE_FIELDS = ["isVisible"] as const;
const UNIQUE_FIELDS = ["slug"] as const;

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

// Hàm mới để lấy thông tin sản phẩm cùng với các phiên bản và hình ảnh
export const getWithDetails = query({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;

    // Lấy các phiên bản của sản phẩm
    const variants = await ctx.db
      .query("product_variants")
      .filter((q) => q.eq(q.field("productId"), id))
      .collect();

    // Lấy các hình ảnh của sản phẩm
    const productImages = await ctx.db
      .query("product_images")
      .filter((q) => q.eq(q.field("productId"), id))
      .collect();

    // Lấy thông tin chi tiết của các hình ảnh
    const imageIds = productImages.map(pi => pi.imageId);
    const images = imageIds.length > 0
      ? (await Promise.all(imageIds.map(id => ctx.db.get(id)))).filter(Boolean)
      : [];

    // Sắp xếp hình ảnh theo sortOrder
    const sortedImages = [...images].sort((a, b) => {
      const aPI = productImages.find(pi => pi.imageId === a?._id);
      const bPI = productImages.find(pi => pi.imageId === b?._id);
      return (aPI?.sortOrder ?? 0) - (bPI?.sortOrder ?? 0);
    });

    return {
      ...product,
      variants,
      images: sortedImages
    };
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

export const listByFK = query({
  args: { categoryId: v.id("categories"), ...listArgsValidator },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query(TABLE)
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();
    let items = docs.filter((d) => matchQ(d, args.q, [...SEARCH_FIELDS] as any));
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
  },
});

export const exists = query({
  args: {
    field: v.string(),
    value: v.any(),
    excludeId: v.optional(v.id(TABLE)),
  },
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
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      shortDesc: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      status: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
      categoryId: v.id("categories"),
    }),
  },
  handler: async (ctx, { dto }) => {
    await ensureUnique(ctx, TABLE, [...UNIQUE_FIELDS] as any, dto);
    const nowTs = now();
    const id = await ctx.db.insert(TABLE, { ...dto, createdAt: nowTs, updatedAt: nowTs });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id(TABLE),
    patch: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      shortDesc: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      status: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ensureUnique(ctx, TABLE, [...UNIQUE_FIELDS] as any, patch, id);
    await ctx.db.patch(id, { ...patch, updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const guardedUpdate = mutation({
  args: {
    id: v.id(TABLE),
    expectedUpdatedAt: v.number(),
    patch: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      shortDesc: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      status: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, { id, expectedUpdatedAt, patch }) => {
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Không tìm thấy bản ghi");
    if (current.updatedAt !== expectedUpdatedAt) throw new Error("Bản ghi đã bị cập nhật bởi phiên khác");
    await ensureUnique(ctx, TABLE, [...UNIQUE_FIELDS] as any, patch, id);
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
  args: { ids: v.array(v.id(TABLE)), patch: v.object({
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDesc: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  }) },
  handler: async (ctx, { ids, patch }) => {
    for (const id of ids) {
      await ensureUnique(ctx, TABLE, [...UNIQUE_FIELDS] as any, patch, id);
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
    const val = !!doc[field as keyof typeof doc];
    await ctx.db.patch(id, { [field]: !val, updatedAt: now() } as any);
    return ctx.db.get(id);
  },
});

export const reorder = mutation({
  args: {
    id: v.id(TABLE),
    toIndex: v.optional(v.number()),
    beforeId: v.optional(v.id(TABLE)),
    afterId: v.optional(v.id(TABLE)),
    categoryScopeId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    return reorderByIndex(ctx, TABLE, args.id, {
      toIndex: args.toIndex,
      beforeId: args.beforeId,
      afterId: args.afterId,
      scope: args.categoryScopeId ? { field: "categoryId", value: args.categoryScopeId } : undefined,
    } as any);
  },
});

export const publish = mutation({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "published", updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const unpublish = mutation({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "draft", updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const clone = mutation({
  args: { id: v.id(TABLE), overrides: v.optional(v.object({
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDesc: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
  })) },
  handler: async (ctx, { id, overrides }) => {
    const src = await ctx.db.get(id);
    if (!src) throw new Error("Không tìm thấy bản ghi để clone");
    const nowTs = now();
    let slug = overrides?.slug ?? `${src.slug}-copy`;
    let i = 1;
    while (await findByField(ctx, TABLE, "slug", slug)) {
      slug = `${src.slug}-copy${i}`;
      i++;
    }
    const dto = {
      name: overrides?.name ?? `${src.name} (Copy)`,
      slug,
      description: overrides?.description ?? src.description,
      shortDesc: overrides?.shortDesc ?? src.shortDesc,
      features: overrides?.features ?? src.features,
      status: overrides?.status ?? src.status,
      sortOrder: overrides?.sortOrder ?? src.sortOrder,
      isVisible: overrides?.isVisible ?? src.isVisible,
      categoryId: overrides?.categoryId ?? src.categoryId,
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
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      shortDesc: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      status: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
      categoryId: v.id("categories"),
    }),
    update: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      shortDesc: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      status: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, { where, create, update }) => {
    const found = await findByField(ctx, TABLE, where.field, where.value);
    if (!found) {
      const nowTs = now();
      const id = await ctx.db.insert(TABLE, { ...create, createdAt: nowTs, updatedAt: nowTs });
      return ctx.db.get(id);
    }
    await ensureUnique(ctx, TABLE, [...UNIQUE_FIELDS] as any, update, found._id);
    await ctx.db.patch(found._id, { ...update, updatedAt: now() });
    return ctx.db.get(found._id);
  },
});

