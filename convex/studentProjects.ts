import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getFeaturedProjects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("studentProjects")
      .withIndex("byFeatured", (q) => q.eq("featured", true))
      .order("desc")
      .take(10);
  },
});

export const getProjectsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentProjects")
      .withIndex("byCategory", (q) => q.eq("category", args.category))
      .order("desc")
      .take(20);
  },
});

export const searchProjects = query({
  args: { searchTerm: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const query = ctx.db.query("studentProjects").withSearchIndex("search_projects", (q) =>
      q.search("title", args.searchTerm)
    );

    if (args.category) {
      return await query.filter((q) => q.eq(q.field("category"), args.category)).take(20);
    }

    return await query.take(20);
  },
});

export const getProjectsByComplexity = query({
  args: { complexity: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentProjects")
      .withIndex("byComplexity", (q) => q.eq("complexity", args.complexity))
      .take(20);
  },
});

export const createProject = mutation({
  args: {
    chatId: v.id("chats"),
    authorId: v.id("convexMembers"),
    authorName: v.string(),
    authorGrade: v.optional(v.string()),
    authorSchool: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    complexity: v.number(),
    skills: v.array(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studentProjects", {
      ...args,
      featured: false,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const likeProject = mutation({
  args: { projectId: v.id("studentProjects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project) {
      await ctx.db.patch(args.projectId, {
        likes: project.likes + 1,
      });
    }
  },
});
