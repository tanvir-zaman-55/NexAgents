import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Generate a random 6-digit OTP code
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check rate limiting for OTP requests
 * Prevents abuse by limiting requests per email/type combination
 */
const checkOTPRateLimit = internalMutation({
  args: {
    email: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
  },
  handler: async (ctx, args) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    // Get recent OTP requests for this email and type
    const recentOTPs = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", args.type)
      )
      .filter((q) => q.gte(q.field("createdAt"), fifteenMinutesAgo))
      .collect();

    // Allow max 3 OTP requests per 15 minutes
    if (recentOTPs.length >= 3) {
      throw new Error(
        "Too many OTP requests. Please wait 15 minutes before trying again."
      );
    }

    return true;
  },
});

/**
 * Generate and send an OTP code for email verification
 */
export const sendVerificationCode = action({
  args: {
    email: v.string(),
    name: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check rate limit
    try {
      await ctx.runMutation(checkOTPRateLimit, {
        email: args.email,
        type: "email_verification",
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rate limit exceeded",
      };
    }

    // Generate OTP code
    const code = generateOTPCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in database
    await ctx.runMutation(api.otp.createOTP, {
      email: args.email,
      code,
      type: "email_verification",
      expiresAt,
      userId: args.userId,
    });

    // Send email with OTP
    const emailResult = await ctx.runAction(api.emails.sendVerificationEmail, {
      email: args.email,
      name: args.name,
      code,
      userId: args.userId,
    });

    return emailResult;
  },
});

/**
 * Generate and send an OTP code for password reset
 */
export const sendPasswordResetCode = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.runQuery(api.simpleAuth.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      // Don't reveal whether email exists
      return { success: true };
    }

    // Check rate limit
    try {
      await ctx.runMutation(checkOTPRateLimit, {
        email: args.email,
        type: "password_reset",
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rate limit exceeded",
      };
    }

    // Generate OTP code
    const code = generateOTPCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in database
    await ctx.runMutation(api.otp.createOTP, {
      email: args.email,
      code,
      type: "password_reset",
      expiresAt,
      userId: user._id,
    });

    // Send email with OTP
    const emailResult = await ctx.runAction(api.emails.sendPasswordResetEmail, {
      email: args.email,
      code,
    });

    return emailResult;
  },
});

/**
 * Internal mutation to create an OTP record
 */
export const createOTP = internalMutation({
  args: {
    email: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
    expiresAt: v.number(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Invalidate any existing unused OTPs for this email and type
    const existingOTPs = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("used"), false))
      .collect();

    for (const otp of existingOTPs) {
      await ctx.db.patch(otp._id, { used: true });
    }

    // Create new OTP
    const otpId = await ctx.db.insert("otpCodes", {
      email: args.email,
      code: args.code,
      type: args.type,
      expiresAt: args.expiresAt,
      used: false,
      attempts: 0,
      createdAt: Date.now(),
      userId: args.userId,
    });

    return otpId;
  },
});

/**
 * Verify an OTP code
 */
export const verifyCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
  },
  handler: async (ctx, args) => {
    // Find the OTP
    const otps = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("used"), false))
      .collect();

    if (otps.length === 0) {
      return { success: false, error: "No valid OTP found" };
    }

    // Get the most recent unused OTP
    const otp = otps.sort((a, b) => b.createdAt - a.createdAt)[0];

    // Check if OTP is expired
    if (Date.now() > otp.expiresAt) {
      await ctx.db.patch(otp._id, { used: true });
      return { success: false, error: "OTP has expired" };
    }

    // Check if too many attempts (rate limiting)
    if ((otp.attempts || 0) >= 5) {
      await ctx.db.patch(otp._id, { used: true });
      return { success: false, error: "Too many invalid attempts" };
    }

    // Verify the code
    if (otp.code !== args.code) {
      // Increment attempts
      await ctx.db.patch(otp._id, {
        attempts: (otp.attempts || 0) + 1,
      });
      return { success: false, error: "Invalid OTP code" };
    }

    // Mark OTP as used
    await ctx.db.patch(otp._id, { used: true });

    return {
      success: true,
      userId: otp.userId,
    };
  },
});

/**
 * Query to get OTP status (for debugging)
 */
export const getOTPStatus = query({
  args: {
    email: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
  },
  handler: async (ctx, args) => {
    const otps = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("used"), false))
      .collect();

    if (otps.length === 0) {
      return { hasActiveOTP: false };
    }

    const otp = otps.sort((a, b) => b.createdAt - a.createdAt)[0];
    const isExpired = Date.now() > otp.expiresAt;

    return {
      hasActiveOTP: !isExpired,
      expiresAt: otp.expiresAt,
      attempts: otp.attempts || 0,
      remainingAttempts: Math.max(0, 5 - (otp.attempts || 0)),
    };
  },
});

/**
 * Cleanup expired OTP codes
 * This should be run as a scheduled job (cron)
 */
export const cleanupExpiredOTPs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all expired OTPs
    const expiredOTPs = await ctx.db
      .query("otpCodes")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    // Delete expired OTPs
    for (const otp of expiredOTPs) {
      await ctx.db.delete(otp._id);
    }

    return { deleted: expiredOTPs.length };
  },
});

/**
 * Cleanup old email logs
 * This should be run as a scheduled job (cron)
 * Keeps logs for 30 days
 */
export const cleanupOldEmailLogs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Get all old email logs
    const oldLogs = await ctx.db
      .query("emailLogs")
      .filter((q) => q.lt(q.field("sentAt"), thirtyDaysAgo))
      .collect();

    // Delete old logs
    for (const log of oldLogs) {
      await ctx.db.delete(log._id);
    }

    return { deleted: oldLogs.length };
  },
});
