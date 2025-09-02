import {query, mutation} from "./_generated/server";
import {v} from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    // Trả về danh sách students; cần gọi collect()
    return await ctx.db.query('students').collect();
  }
});

export const createStudent = mutation({
  args: { 
    name: v.string(), age: v.number(), class: v.string() 
  },
  handler: async (ctx,args) => {
    const newStudentId = await ctx.db.insert('students', {
        name: args.name,
        age: args.age,
        class: args.class
    });
    return await ctx.db.get(newStudentId);
  }
});

export const deleteStudent = mutation({
    args: {
        id: v.id("students"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return { success: true };
    }
});
