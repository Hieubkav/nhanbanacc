import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		text: v.string(),
		note: v.optional(v.string()), // 👈 cho phép thiếu
		completed: v.boolean(),
	}),
	students: defineTable({
		name: v.string(),
		age: v.number(),
		class: v.string(),
	}),
});
