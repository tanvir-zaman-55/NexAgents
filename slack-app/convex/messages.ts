import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();

    // Enrich messages with user data
    return await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        let avatarUrl = null;
        if (user?.avatarStorageId) {
          avatarUrl = await ctx.storage.getUrl(user.avatarStorageId);
        }
        return {
          ...message,
          user: {
            name: user?.name ?? "Unknown User",
            avatarUrl,
          },
        };
      })
    );
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      userId: args.userId,
      text: args.text,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withSearchIndex("search_text", (q) => q.search("text", args.query))
      .take(50);

    // Enrich with user and channel data
    return await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        const channel = await ctx.db.get(message.channelId);
        let avatarUrl = null;
        if (user?.avatarStorageId) {
          avatarUrl = await ctx.storage.getUrl(user.avatarStorageId);
        }
        return {
          ...message,
          user: {
            name: user?.name ?? "Unknown User",
            avatarUrl,
          },
          channel: {
            name: channel?.name ?? "Unknown Channel",
          },
        };
      })
    );
  },
});
