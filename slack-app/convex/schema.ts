import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
  }),

  channels: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  messages: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_channel", ["channelId", "createdAt"])
    .searchIndex("search_text", {
      searchField: "text",
    }),
});
