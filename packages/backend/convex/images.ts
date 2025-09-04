import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  listArgsValidator,
  applyFilters,
  applySort,
  paginate,
  matchQ,
  findByField,
  buildSuggest,
  now,
  onlyBooleanToggle,
  reorderByIndex,
} from "./lib/crud";

const TABLE = "images" as const;
const SEARCH_FIELDS = ["filename", "url", "alt", "title", "mimeType"] as const;
const LABEL_FIELDS = ["title", "alt", "filename"] as const;
const TOGGLE_FIELDS = ["isVisible"] as const;

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

// Hàm mới để lấy images theo danh sách imageIds
export const listByIds = query({
  args: { imageIds: v.array(v.id(TABLE)), ...listArgsValidator },
  handler: async (ctx, args) => {
    if (args.imageIds.length === 0) {
      return { items: [], cursor: null, hasMore: false };
    }
    
    const docs = await ctx.db
      .query(TABLE)
      .filter((q) => q.or(...args.imageIds.map(id => q.eq(q.field("_id"), id))))
      .collect();
    
    let items = docs.filter((d) => matchQ(d, args.q, [...SEARCH_FIELDS] as any));
    items = applyFilters(items, args.filters);
    items = applySort(items, args.sort ?? { field: "sortOrder", direction: "asc" });
    return paginate(items, args.page, args.pageSize, args.cursor);
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
      filename: v.string(),
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      alt: v.optional(v.string()),
      title: v.optional(v.string()),
      size: v.number(),
      mimeType: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
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
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      alt: v.optional(v.string()),
      title: v.optional(v.string()),
      size: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, { ...patch, updatedAt: now() });
    return ctx.db.get(id);
  },
});

export const guardedUpdate = mutation({
  args: { id: v.id(TABLE), expectedUpdatedAt: v.number(), patch: v.object({
    filename: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  }) },
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
  args: { ids: v.array(v.id(TABLE)), patch: v.object({
    filename: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  }) },
  handler: async (ctx, { ids, patch }) => {
    for (const id of ids) await ctx.db.patch(id, { ...patch, updatedAt: now() });
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
  args: { id: v.id(TABLE), toIndex: v.optional(v.number()), beforeId: v.optional(v.id(TABLE)), afterId: v.optional(v.id(TABLE)) },
  handler: async (ctx, args) => reorderByIndex(ctx, TABLE, args.id, args as any),
});

export const publish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("images không có trường status"); } });
export const unpublish = mutation({ args: { id: v.id(TABLE) }, handler: async () => { throw new Error("images không có trường status"); } });

export const clone = mutation({
  args: { id: v.id(TABLE), overrides: v.optional(v.object({
    filename: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
  })) },
  handler: async (ctx, { id, overrides }) => {
    const src = await ctx.db.get(id);
    if (!src) throw new Error("Không tìm thấy bản ghi để clone");
    const nowTs = now();
    const dto = {
      filename: overrides?.filename ?? src.filename,
      url: overrides?.url ?? src.url,
      storageId: overrides?.storageId ?? (src as any).storageId,
      alt: overrides?.alt ?? src.alt,
      title: overrides?.title ?? (src.title ? `${src.title} (Copy)` : undefined),
      size: overrides?.size ?? src.size,
      mimeType: overrides?.mimeType ?? src.mimeType,
      sortOrder: overrides?.sortOrder ?? src.sortOrder,
      isVisible: overrides?.isVisible ?? src.isVisible,
      createdAt: nowTs,
      updatedAt: nowTs,
    } as any;
    const newId = await ctx.db.insert(TABLE, dto);
    return ctx.db.get(newId);
  },
});

export const upsert = mutation({
  args: {
    where: v.object({ field: v.string(), value: v.any() }),
    create: v.object({
      filename: v.string(),
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      alt: v.optional(v.string()),
      title: v.optional(v.string()),
      size: v.number(),
      mimeType: v.string(),
      sortOrder: v.number(),
      isVisible: v.boolean(),
    }),
    update: v.object({
      filename: v.optional(v.string()),
      url: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      alt: v.optional(v.string()),
      title: v.optional(v.string()),
      size: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
      isVisible: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { where, create, update }) => {
    const found = await findByField(ctx, TABLE, where.field, where.value);
    if (!found) {
      const nowTs = now();
      const id = await ctx.db.insert(TABLE, { ...create, createdAt: nowTs, updatedAt: nowTs });
      return ctx.db.get(id);
    }
    await ctx.db.patch(found._id, { ...update, updatedAt: now() });
    return ctx.db.get(found._id);
  },
});

// Upload trực tiếp vào Convex Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

// Tạo bản ghi ảnh sau khi đã POST file tới uploadUrl và nhận storageId
export const createFromUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    sortOrder: v.number(),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const nowTs = now();
    const id = await ctx.db.insert(TABLE, {
      filename: args.filename,
      url: undefined,
      storageId: args.storageId,
      alt: args.alt,
      title: args.title,
      size: args.size,
      mimeType: args.mimeType,
      sortOrder: args.sortOrder,
      isVisible: args.isVisible,
      createdAt: nowTs,
      updatedAt: nowTs,
    } as any);
    return ctx.db.get(id);
  },
});

// Lấy URL tạm thời để xem ảnh (ưu tiên storageId)
export const getViewUrl = query({
  args: { id: v.id(TABLE) },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return { url: null as string | null };
    // @ts-ignore - có thể không có storageId trên bản ghi cũ
    const sid = (doc as any).storageId as any;
    if (sid) {
      const url = await ctx.storage.getUrl(sid);
      return { url };
    }
    // fallback url chuỗi cũ nếu có
    return { url: (doc as any).url ?? null };
  },
});
