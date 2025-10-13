import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getTeacherClassrooms = query({
  args: { teacherId: v.id("convexMembers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classrooms")
      .withIndex("byTeacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
  },
});

export const createClassroom = mutation({
  args: {
    teacherId: v.id("convexMembers"),
    name: v.string(),
    gradeLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("classrooms", {
      teacherId: args.teacherId,
      name: args.name,
      gradeLevel: args.gradeLevel,
      studentIds: [],
      createdAt: Date.now(),
    });
  },
});

export const addStudentToClassroom = mutation({
  args: {
    classroomId: v.id("classrooms"),
    studentId: v.id("convexMembers"),
  },
  handler: async (ctx, args) => {
    const classroom = await ctx.db.get(args.classroomId);
    if (classroom && !classroom.studentIds.includes(args.studentId)) {
      await ctx.db.patch(args.classroomId, {
        studentIds: [...classroom.studentIds, args.studentId],
      });
    }
  },
});

export const getStudentProjects = query({
  args: { studentIds: v.array(v.id("convexMembers")) },
  handler: async (ctx, args) => {
    const projects = [];
    for (const studentId of args.studentIds) {
      const studentProjects = await ctx.db
        .query("studentProjects")
        .withIndex("byAuthor", (q) => q.eq("authorId", studentId))
        .collect();
      projects.push(...studentProjects);
    }
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  },
});
