import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPrompts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prompts").order("desc").collect();
  },
});

export const createPrompt = mutation({
  args: {
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("prompts", {
      name: args.name,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePrompt = mutation({
  args: {
    id: v.id("prompts"),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

export const deletePrompt = mutation({
  args: {
    id: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
