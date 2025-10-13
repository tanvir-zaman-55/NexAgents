import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getFeaturedChallenge = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("challenges")
      .withIndex("byFeatured", (q) => q.eq("featured", true))
      .first();
  },
});

export const getChallengesByMonth = query({
  args: { year: v.number(), month: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("challenges")
      .withIndex("byMonth", (q) => q.eq("year", args.year).eq("month", args.month))
      .collect();
  },
});

export const getAllChallenges = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("challenges").order("desc").collect();
  },
});

export const submitChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
    chatId: v.id("chats"),
    authorId: v.id("convexMembers"),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("challengeSubmissions", {
      challengeId: args.challengeId,
      chatId: args.chatId,
      authorId: args.authorId,
      authorName: args.authorName,
      submittedAt: Date.now(),
      winner: false,
    });
  },
});

export const getChallengeSubmissions = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("challengeSubmissions")
      .withIndex("byChallenge", (q) => q.eq("challengeId", args.challengeId))
      .order("desc")
      .collect();
  },
});
