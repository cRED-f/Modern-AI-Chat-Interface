import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    content: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("ai"),
      v.literal("assistant"),
      v.literal("system")
    ),
    timestamp: v.number(),
    chatId: v.string(),
  }).index("by_chat", ["chatId"]),

  chats: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  settings: defineTable({
    apiKey: v.string(),
    provider: v.string(),
    modelName: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxContextLength: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  prompts: defineTable({
    name: v.string(),
    content: v.string(),
    targetModel: v.optional(v.union(v.literal("main"), v.literal("assistant"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  assistants: defineTable({
    name: v.string(),
    modelName: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxContextLength: v.optional(v.number()),
    activeAfterQuestions: v.optional(v.number()),
    systemPrompt: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
