import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Simple password hashing (for demo purposes - in production use proper hashing)
function hashPassword(password: string): string {
  // Simple hash for demo - in production, use bcrypt or similar
  return btoa(password + "salt");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Sign up new user
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user with email verification disabled by default
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: hashPassword(args.password),
      name: args.name || args.email.split("@")[0],
      role: args.email === "admin@example.com" ? "admin" : "user",
      emailVerified: false, // User needs to verify email
      twoFactorEnabled: false,
      createdAt: Date.now(),
    });

    return {
      userId,
      email: args.email,
      name: args.name || args.email.split("@")[0],
    };
  },
});

// Sign in
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!verifyPassword(args.password, user.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };
  },
});

// Get current user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
      emailVerified: user.emailVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
    };
  },
});

// Check if user is admin
export const isAdmin = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.role === "admin";
  },
});

// Get user by email (used internally)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
      emailVerified: user.emailVerified || false,
    };
  },
});

// Verify email after OTP confirmation
export const verifyEmail = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify the OTP code
    const verification = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", user.email).eq("type", "email_verification")
      )
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("used"), false))
      .first();

    if (!verification) {
      throw new Error("Invalid or expired verification code");
    }

    // Check if expired
    if (Date.now() > verification.expiresAt) {
      throw new Error("Verification code has expired");
    }

    // Mark email as verified
    await ctx.db.patch(args.userId, {
      emailVerified: true,
    });

    // Mark OTP as used
    await ctx.db.patch(verification._id, {
      used: true,
    });

    return { success: true };
  },
});

// Reset password with OTP verification
export const resetPassword = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the OTP code
    const verification = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", "password_reset")
      )
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("used"), false))
      .first();

    if (!verification) {
      throw new Error("Invalid or expired reset code");
    }

    // Check if expired
    if (Date.now() > verification.expiresAt) {
      throw new Error("Reset code has expired");
    }

    // Update password
    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
    });

    // Mark OTP as used
    await ctx.db.patch(verification._id, {
      used: true,
    });

    return { success: true };
  },
});

// Request email verification (sends OTP)
export const requestEmailVerification = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user details
    const user = await ctx.runQuery(api.simpleAuth.getUser, {
      userId: args.userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      return { success: true, message: "Email already verified" };
    }

    // Send verification code
    const result = await ctx.runAction(api.otp.sendVerificationCode, {
      email: user.email,
      name: user.name,
      userId: args.userId,
    });

    return result;
  },
});
