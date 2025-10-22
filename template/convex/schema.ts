import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    twoFactorEnabled: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_verified", ["emailVerified"]),

  // Email logs for tracking sent emails
  emailLogs: defineTable({
    to: v.string(),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    sentAt: v.number(),
    userId: v.optional(v.id("users")),
    type: v.string(), // "welcome", "verification", "reset", "login_alert"
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // OTP codes for email verification and password reset
  otpCodes: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    code: v.string(), // 6-digit code
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
    expiresAt: v.number(),
    used: v.boolean(),
    attempts: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email_and_type", ["email", "type"])
    .index("by_expires", ["expiresAt"])
    .index("by_user", ["userId"]),

  // Add your custom tables here
  // Example: bookings, products, orders, etc.
});
