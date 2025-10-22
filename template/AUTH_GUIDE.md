# Authentication Guide

This guide covers the complete authentication system including user signup, signin, email verification, and password reset flows.

## Table of Contents

1. [Overview](#overview)
2. [User Signup Flow](#user-signup-flow)
3. [User Signin Flow](#user-signin-flow)
4. [Email Verification Flow](#email-verification-flow)
5. [Password Reset Flow](#password-reset-flow)
6. [Session Management](#session-management)
7. [Role-Based Access Control](#role-based-access-control)
8. [Security Features](#security-features)

## Overview

The authentication system is built on:
- **Convex** for backend database and serverless functions
- **Resend** for transactional email delivery
- **bcrypt** for secure password hashing
- **localStorage** for client-side session persistence
- **OTP (One-Time Password)** for email verification and password reset

### Key Components

**Backend (convex/):**
- `simpleAuth.ts` - Core authentication functions
- `emails.ts` - Email sending functions
- `otp.ts` - OTP generation and verification
- `crons.ts` - Scheduled cleanup jobs

**Frontend (src/):**
- `App.tsx` - Main app with auth routing
- `SignInForm.tsx` - Combined sign in/sign up form
- `pages/VerifyEmail.tsx` - Email verification page
- `pages/ForgotPassword.tsx` - Password reset request
- `pages/ResetPassword.tsx` - Password reset with OTP
- `components/auth/OTPInput.tsx` - Reusable OTP input
- `components/auth/VerificationBanner.tsx` - Unverified user warning

## User Signup Flow

### 1. User Interface

The `SignInForm` component provides a toggle between sign in and sign up modes:

```typescript
// User fills out the form
<form onSubmit={handleSubmit}>
  <Input name="email" type="email" required />
  <Input name="password" type="password" minLength={6} required />
  <Button type="submit">Sign Up</Button>
</form>
```

### 2. Backend Processing

When the form is submitted, the `signUp` mutation is called:

```typescript
// convex/simpleAuth.ts
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Create user with unverified email
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: hashPassword(args.password),
      name: args.name || args.email.split("@")[0],
      role: args.email === "admin@example.com" ? "admin" : "user",
      emailVerified: false,  // Requires verification
      twoFactorEnabled: false,
      createdAt: Date.now(),
    });

    return { userId, email: args.email };
  },
});
```

### 3. Post-Signup

After signup:
- User ID is stored in localStorage
- User is logged in but marked as unverified
- A yellow verification banner appears prompting email verification
- User can access the app with limited features until verified

### 4. Admin Account

The system automatically assigns admin role to `admin@example.com`:
- Password: `admin123` (default, should be changed)
- Admin users see the AdminDashboard instead of UserDashboard
- Admin status is determined by the `role` field in the users table

## User Signin Flow

### 1. User Interface

Same `SignInForm` component in "sign in" mode:

```typescript
<form onSubmit={handleSubmit}>
  <Input name="email" type="email" required />
  <Input name="password" type="password" required />
  <button type="button" onClick={onForgotPassword}>
    Forgot Password?
  </button>
  <Button type="submit">Sign In</Button>
</form>
```

### 2. Backend Processing

The `signIn` mutation validates credentials:

```typescript
// convex/simpleAuth.ts
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = verifyPassword(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    };
  },
});
```

### 3. Post-Signin

After successful signin:
- User ID is stored in localStorage
- User's data is loaded via `getUser` query
- If email is not verified, verification banner appears
- User is redirected to appropriate dashboard (Admin or User)

## Email Verification Flow

### 1. Trigger Verification

User can trigger verification in two ways:

**A. From Verification Banner:**
```typescript
// src/components/auth/VerificationBanner.tsx
const handleSendCode = async () => {
  await requestVerification({ userId });
  toast.success("Verification code sent! Check your email.");
  onVerifyClick(); // Navigate to verification page
};
```

**B. Direct Navigation:**
User clicks "Verify Email" and is taken to `/verify-email`

### 2. Request OTP Code

Backend generates and emails a 6-digit code:

```typescript
// convex/otp.ts
export const sendVerificationCode = action({
  args: { email: v.string(), name: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Rate limit check (max 3 per 15 min)
    await ctx.runMutation(checkOTPRateLimit, {
      email: args.email,
      type: "email_verification",
    });

    // Generate 6-digit code
    const code = generateOTPCode(); // e.g., "123456"
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in database
    await ctx.runMutation(api.otp.createOTP, {
      email: args.email,
      code,
      type: "email_verification",
      expiresAt,
      userId: args.userId,
    });

    // Send email
    return await ctx.runAction(api.emails.sendVerificationEmail, {
      email: args.email,
      name: args.name,
      code,
      userId: args.userId,
    });
  },
});
```

### 3. User Enters OTP

The VerifyEmail page displays an OTP input:

```typescript
// src/pages/VerifyEmail.tsx
<OTPInput
  onComplete={async (code) => {
    await verifyEmail({ userId, code });
    toast.success("Email verified successfully!");
    onVerified(); // Refresh user data
  }}
  disabled={isVerifying}
/>
```

### 4. Backend Verification

The `verifyEmail` mutation validates the OTP:

```typescript
// convex/simpleAuth.ts
export const verifyEmail = mutation({
  args: { userId: v.id("users"), code: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Find OTP
    const verification = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", user.email).eq("type", "email_verification")
      )
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("used"), false))
      .first();

    if (!verification) {
      throw new Error("Invalid verification code");
    }

    // Check expiration
    if (Date.now() > verification.expiresAt) {
      throw new Error("Verification code has expired");
    }

    // Mark email as verified
    await ctx.db.patch(args.userId, { emailVerified: true });

    // Mark OTP as used
    await ctx.db.patch(verification._id, { used: true });

    return { success: true };
  },
});
```

### 5. Post-Verification

After successful verification:
- User's `emailVerified` field is set to `true`
- Verification banner disappears
- User gains full access to all features
- OTP code is marked as used (single-use only)

## Password Reset Flow

### Two-Step Process

The password reset flow consists of two pages:
1. **ForgotPassword** - User enters email
2. **ResetPassword** - User enters OTP + new password

### Step 1: Request Reset Code

**Frontend:**
```typescript
// src/pages/ForgotPassword.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await sendResetCode({ email });
  toast.success("Reset code sent! Check your email.");
  onCodeSent(email); // Navigate to ResetPassword page
};
```

**Backend:**
```typescript
// convex/otp.ts
export const sendPasswordResetCode = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.runQuery(api.simpleAuth.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("No account found with this email");
    }

    // Rate limit check
    await ctx.runMutation(checkOTPRateLimit, {
      email: args.email,
      type: "password_reset",
    });

    // Generate and send OTP
    const code = generateOTPCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await ctx.runMutation(api.otp.createOTP, {
      email: args.email,
      code,
      type: "password_reset",
      expiresAt,
      userId: user._id,
    });

    return await ctx.runAction(api.emails.sendPasswordResetEmail, {
      email: args.email,
      name: user.name,
      code,
    });
  },
});
```

### Step 2: Reset Password with OTP

**Frontend:**
```typescript
// src/pages/ResetPassword.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Validate inputs
  if (code.length !== 6) {
    toast.error("Please enter the 6-digit code");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  // Reset password
  await resetPassword({ email, code, newPassword });
  toast.success("Password reset successfully!");
  onSuccess(); // Navigate back to sign in
};
```

**Backend:**
```typescript
// convex/simpleAuth.ts
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

    // Verify OTP
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

    // Check expiration
    if (Date.now() > verification.expiresAt) {
      throw new Error("Reset code has expired");
    }

    // Update password
    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
    });

    // Mark OTP as used
    await ctx.db.patch(verification._id, { used: true });

    return { success: true };
  },
});
```

### Password Requirements

- Minimum length: 8 characters (enforced in frontend and backend)
- Can contain any characters
- Hashed using bcrypt before storage
- Never stored or transmitted in plain text

## Session Management

### Client-Side

Sessions are managed using localStorage:

```typescript
// src/App.tsx
const [userId, setUserId] = useState<Id<"users"> | null>(null);

// Load session on mount
useEffect(() => {
  const savedUserId = localStorage.getItem("userId");
  if (savedUserId) {
    setUserId(savedUserId as Id<"users">);
  }
}, []);

// Save session on sign in
const handleSignIn = (newUserId: Id<"users">) => {
  setUserId(newUserId);
  localStorage.setItem("userId", newUserId);
};

// Clear session on sign out
const handleSignOut = () => {
  setUserId(null);
  localStorage.removeItem("userId");
};
```

### Server-Side

User data is fetched reactively via Convex query:

```typescript
const currentUser = useQuery(
  api.simpleAuth.getUser,
  userId ? { userId } : "skip"
);

// currentUser automatically updates when database changes
const isAuthenticated = !!currentUser;
const needsVerification = isAuthenticated && !currentUser?.emailVerified;
```

### Session Security

- User ID is stored in localStorage (survives page refresh)
- No JWT or tokens needed (Convex handles auth state)
- Sign out clears localStorage immediately
- Session persists until explicit sign out

## Role-Based Access Control

### User Roles

The system supports two roles:
- **admin** - Full access to AdminDashboard
- **user** - Access to UserDashboard (default)

### Role Assignment

```typescript
// Automatic admin assignment during signup
const userId = await ctx.db.insert("users", {
  email: args.email,
  passwordHash: hashPassword(args.password),
  name: args.name || args.email.split("@")[0],
  role: args.email === "admin@example.com" ? "admin" : "user",
  emailVerified: false,
  twoFactorEnabled: false,
  createdAt: Date.now(),
});
```

### Role-Based Rendering

```typescript
// src/App.tsx
const isAdmin = currentUser?.role === "admin";

{isAuthenticated ? (
  <>
    {isAdmin ? (
      <AdminDashboard />
    ) : (
      <UserDashboard userName={currentUser?.name || "User"} />
    )}
  </>
) : (
  <SignInForm onSignIn={handleSignIn} />
)}
```

### Extending Roles

To add more roles:

1. Update the schema (optional - currently uses string):
```typescript
// convex/schema.ts
role: v.union(
  v.literal("admin"),
  v.literal("user"),
  v.literal("moderator"),
  v.literal("viewer")
)
```

2. Add role-based logic:
```typescript
const canModerate = currentUser?.role === "admin" || currentUser?.role === "moderator";
const canView = currentUser?.role !== "viewer";
```

## Security Features

### Password Security

- **Hashing**: bcrypt with automatic salt generation
- **Minimum Length**: 6 characters (configurable)
- **Storage**: Only hashed passwords stored in database
- **Comparison**: Constant-time comparison via bcrypt

### OTP Security

- **6-digit codes**: 1 in 1 million chance of guessing
- **15-minute expiration**: Limited window to use code
- **Single-use**: Marked as used after verification
- **Rate limiting**: Max 3 requests per 15 minutes per email
- **Attempt limiting**: Max 5 verification attempts per code
- **Automatic cleanup**: Expired codes removed every 15 minutes

### Rate Limiting

```typescript
// convex/otp.ts
const checkOTPRateLimit = mutation({
  args: { email: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    const recentOTPs = await ctx.db
      .query("otpCodes")
      .withIndex("by_email_and_type", (q) =>
        q.eq("email", args.email).eq("type", args.type)
      )
      .filter((q) => q.gte(q.field("createdAt"), fifteenMinutesAgo))
      .collect();

    if (recentOTPs.length >= 3) {
      throw new Error("Too many requests. Please try again in 15 minutes.");
    }
  },
});
```

### Email Security

- **Transactional emails only**: No marketing without consent
- **From address validation**: Requires verified Resend domain
- **Logging**: All email attempts logged for audit
- **Error handling**: Failed sends logged with error messages

### Frontend Security

- **Input validation**: Email format, password length checked
- **Error messages**: Generic messages prevent user enumeration
- **HTTPS only**: Required in production for secure transmission
- **XSS prevention**: React automatically escapes user input
- **CSRF protection**: Not needed (stateless API calls)

### Best Practices

1. **Always validate on both client and server**
2. **Use generic error messages** (e.g., "Invalid email or password" instead of "Email not found")
3. **Implement rate limiting** for all sensitive operations
4. **Log security events** (failed logins, password resets)
5. **Expire OTP codes** after reasonable time (15 minutes)
6. **Require strong passwords** (consider adding complexity rules)
7. **Enable HTTPS in production** (automatic with most hosting)
8. **Regular security audits** of authentication code

### Future Security Enhancements

Consider implementing:
- **Two-Factor Authentication (2FA)**: Schema already includes `twoFactorEnabled` flag
- **Account lockout**: After X failed login attempts
- **Password complexity rules**: Uppercase, numbers, special chars
- **Session timeout**: Auto-logout after inactivity
- **IP-based rate limiting**: More sophisticated abuse prevention
- **Email change verification**: Require OTP for email updates
- **Audit logs**: Track all authentication events
- **Breach detection**: Check passwords against known breach databases

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## API Reference

See [API.md](./API.md) for complete function documentation.
