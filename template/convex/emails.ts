import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { Resend } from "resend";
import { Id } from "./_generated/dataModel";

// Initialize Resend client
// In production, set RESEND_API_KEY environment variable in Convex dashboard
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Internal mutation to log email sending attempts
 */
export const logEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    userId: v.optional(v.id("users")),
    type: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      to: args.to,
      subject: args.subject,
      status: args.status,
      sentAt: Date.now(),
      userId: args.userId,
      type: args.type,
      errorMessage: args.errorMessage,
    });
  },
});

/**
 * Send a welcome email to newly registered users
 */
export const sendWelcomeEmail = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: args.email,
        subject: "Welcome to Our Platform!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Welcome, ${args.name}!</h1>
            <p>Thank you for signing up. We're excited to have you on board.</p>
            <p>You can now access all features of our platform.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                If you have any questions, feel free to reply to this email.
              </p>
            </div>
          </div>
        `,
      });

      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Welcome to Our Platform!",
        status: "sent",
        userId: args.userId,
        type: "welcome",
      });

      return { success: true, messageId: result.id };
    } catch (error) {
      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Welcome to Our Platform!",
        status: "failed",
        userId: args.userId,
        type: "welcome",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Failed to send welcome email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

/**
 * Send an OTP verification email
 */
export const sendVerificationEmail = action({
  args: {
    userId: v.optional(v.id("users")),
    email: v.string(),
    name: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: args.email,
        subject: "Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Verify Your Email</h1>
            <p>Hi ${args.name},</p>
            <p>Please use the following verification code to confirm your email address:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h2 style="color: #8B5CF6; font-size: 32px; letter-spacing: 8px; margin: 0;">
                ${args.code}
              </h2>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        `,
      });

      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Verify Your Email Address",
        status: "sent",
        userId: args.userId,
        type: "verification",
      });

      return { success: true, messageId: result.id };
    } catch (error) {
      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Verify Your Email Address",
        status: "failed",
        userId: args.userId,
        type: "verification",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Failed to send verification email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

/**
 * Send a password reset email with OTP
 */
export const sendPasswordResetEmail = action({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: args.email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">Password Reset Request</h1>
            <p>You requested to reset your password. Use the following code to proceed:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h2 style="color: #8B5CF6; font-size: 32px; letter-spacing: 8px; margin: 0;">
                ${args.code}
              </h2>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p><strong>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</strong></p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        `,
      });

      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Reset Your Password",
        status: "sent",
        type: "reset",
      });

      return { success: true, messageId: result.id };
    } catch (error) {
      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "Reset Your Password",
        status: "failed",
        type: "reset",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Failed to send password reset email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

/**
 * Send a login alert email for security monitoring
 */
export const sendLoginAlert = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const timestamp = new Date().toLocaleString();

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: args.email,
        subject: "New Login to Your Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B5CF6;">New Login Detected</h1>
            <p>Hi ${args.name},</p>
            <p>We detected a new login to your account:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp}</p>
              ${args.ipAddress ? `<p style="margin: 5px 0;"><strong>IP Address:</strong> ${args.ipAddress}</p>` : ''}
            </div>
            <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                This is an automated security notification.
              </p>
            </div>
          </div>
        `,
      });

      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "New Login to Your Account",
        status: "sent",
        userId: args.userId,
        type: "login_alert",
      });

      return { success: true, messageId: result.id };
    } catch (error) {
      await ctx.runMutation(logEmail, {
        to: args.email,
        subject: "New Login to Your Account",
        status: "failed",
        userId: args.userId,
        type: "login_alert",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("Failed to send login alert:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});
