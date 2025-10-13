import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserPreferences = query({
  args: { memberId: v.id("convexMembers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPreferences")
      .withIndex("byMemberId", (q) => q.eq("memberId", args.memberId))
      .first();
  },
});

export const setUserPreferences = mutation({
  args: {
    memberId: v.id("convexMembers"),
    accountType: v.union(
      v.literal("personal"),
      v.literal("education"),
      v.literal("other")
    ),
    educationRole: v.optional(
      v.union(v.literal("student"), v.literal("teacher"), v.literal("neither"))
    ),
    showLearningAssistant: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("byMemberId", (q) => q.eq("memberId", args.memberId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountType: args.accountType,
        educationRole: args.educationRole,
        showLearningAssistant: args.showLearningAssistant,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        memberId: args.memberId,
        accountType: args.accountType,
        educationRole: args.educationRole,
        showLearningAssistant: args.showLearningAssistant,
      });
    }
  },
});

export const toggleLearningAssistant = mutation({
  args: { memberId: v.id("convexMembers") },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("byMemberId", (q) => q.eq("memberId", args.memberId))
      .first();

    if (prefs) {
      await ctx.db.patch(prefs._id, {
        showLearningAssistant: !prefs.showLearningAssistant,
      });
    }
  },
});
