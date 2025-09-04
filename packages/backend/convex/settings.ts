import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { now } from "./lib/crud";

const TABLE = "settings" as const;

// Shape phải khớp với schema.ts
const fieldsShape = {
  siteName: v.optional(v.string()),
  slogan: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  address: v.optional(v.string()),
  logoId: v.optional(v.id("images")),
  faviconId: v.optional(v.id("images")),
  seoDefaultTitle: v.optional(v.string()),
  seoDefaultDescription: v.optional(v.string()),
  socialFacebook: v.optional(v.string()),
  socialYoutube: v.optional(v.string()),
  socialTiktok: v.optional(v.string()),
  uiPrimaryColor: v.optional(v.string()),
} as const;

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query(TABLE).collect();
    return docs[0] ?? null;
  },
});

export const saveOne = mutation({
  args: { patch: v.object({ ...fieldsShape, siteName: v.optional(v.string()) }) },
  handler: async (ctx, { patch }) => {
    const docs = await ctx.db.query(TABLE).collect();
    const ts = now();
    if (docs.length === 0) {
      if (!patch.siteName || !patch.siteName.trim()) {
        throw new Error("Thiếu 'siteName' khi tạo bản ghi settings đầu tiên");
      }
      const id = await ctx.db.insert(TABLE, { ...(patch as any), createdAt: ts, updatedAt: ts });
      return ctx.db.get(id);
    }
    const current = docs[0];
    await ctx.db.patch(current._id, { ...(patch as any), updatedAt: ts });
    return ctx.db.get(current._id);
  },
});

