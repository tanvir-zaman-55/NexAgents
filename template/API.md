# API Reference

Complete API reference for all authentication, email, and OTP functions.

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Email API](#email-api)
3. [OTP API](#otp-api)
4. [Schema Reference](#schema-reference)
5. [Types](#types)

## Authentication API

All authentication functions are in `convex/simpleAuth.ts`.

### signUp

Creates a new user account.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;        // User's email address (must be unique)
  password: string;     // Plain text password (will be hashed)
  name?: string;        // Optional display name (defaults to email prefix)
}
```

**Returns:**
```typescript
{
  userId: Id<"users">;  // Generated user ID
  email: string;        // User's email
  name?: string;        // User's display name
}
```

**Errors:**
- `"Email already registered"` - Email already exists in database
- `"Password must be at least 6 characters"` - Password too short

**Example:**
```typescript
const result = await signUp({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe"
});
console.log(result.userId); // "jx7abc..."
```

**Notes:**
- New users start with `emailVerified: false`
- Password is hashed with bcrypt before storage
- Admin role assigned automatically to `admin@example.com`
- Default role is "user"

---

### signIn

Authenticates an existing user.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;        // User's email address
  password: string;     // Plain text password
}
```

**Returns:**
```typescript
{
  userId: Id<"users">;  // User's ID
  email: string;        // User's email
  name: string;         // User's display name
  emailVerified?: boolean; // Email verification status
}
```

**Errors:**
- `"Invalid email or password"` - Credentials don't match (generic message for security)

**Example:**
```typescript
const result = await signIn({
  email: "user@example.com",
  password: "securePassword123"
});

localStorage.setItem("userId", result.userId);
```

**Notes:**
- Uses constant-time password comparison via bcrypt
- Returns generic error message to prevent user enumeration
- Does not create a session token (use returned userId for state)

---

### getUser

Retrieves user data by ID.

**Type:** `query`

**Arguments:**
```typescript
{
  userId: Id<"users">; // User's ID
}
```

**Returns:**
```typescript
{
  _id: Id<"users">;
  email: string;
  name: string;
  role: string;         // "admin" | "user"
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: number;    // Unix timestamp
}
```

**Errors:**
- `"User not found"` - User ID doesn't exist

**Example:**
```typescript
const user = useQuery(api.simpleAuth.getUser, { userId });

if (user?.role === "admin") {
  // Show admin interface
}
```

**Notes:**
- Does not return passwordHash (security)
- Automatically reactive (updates when user data changes)
- Use `"skip"` as second argument to conditionally skip query

---

### getUserByEmail

Retrieves user data by email address.

**Type:** `query`

**Arguments:**
```typescript
{
  email: string; // User's email address
}
```

**Returns:**
```typescript
{
  _id: Id<"users">;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
} | null  // Returns null if not found
```

**Example:**
```typescript
const user = await ctx.runQuery(api.simpleAuth.getUserByEmail, {
  email: "user@example.com"
});

if (!user) {
  throw new Error("No account found with this email");
}
```

**Notes:**
- Used internally by password reset flow
- Returns null instead of throwing error if user not found
- Does not return passwordHash or sensitive data

---

### verifyEmail

Verifies a user's email using an OTP code.

**Type:** `mutation`

**Arguments:**
```typescript
{
  userId: Id<"users">; // User's ID
  code: string;        // 6-digit OTP code
}
```

**Returns:**
```typescript
{
  success: boolean;    // Always true if doesn't throw
}
```

**Errors:**
- `"User not found"` - Invalid user ID
- `"Invalid verification code"` - Code not found or already used
- `"Verification code has expired"` - Code older than 15 minutes

**Example:**
```typescript
await verifyEmail({
  userId: user._id,
  code: "123456"
});

// User's emailVerified is now true
```

**Notes:**
- Marks OTP as used after successful verification
- Sets user's `emailVerified` field to `true`
- OTP must be type "email_verification"

---

### resetPassword

Resets a user's password using an OTP code.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;        // User's email address
  code: string;         // 6-digit OTP code
  newPassword: string;  // New password (plain text, will be hashed)
}
```

**Returns:**
```typescript
{
  success: boolean;     // Always true if doesn't throw
}
```

**Errors:**
- `"User not found"` - Email doesn't exist
- `"Invalid or expired reset code"` - Code not found, used, or expired
- `"Reset code has expired"` - Code older than 15 minutes

**Example:**
```typescript
await resetPassword({
  email: "user@example.com",
  code: "123456",
  newPassword: "newSecurePassword456"
});

toast.success("Password reset successfully!");
```

**Notes:**
- Marks OTP as used after successful reset
- Hashes new password with bcrypt
- OTP must be type "password_reset"
- User can immediately sign in with new password

---

### requestEmailVerification

Sends a verification email with OTP to user.

**Type:** `action`

**Arguments:**
```typescript
{
  userId: Id<"users">; // User's ID
}
```

**Returns:**
```typescript
{
  success: boolean;
  message?: string;    // Optional message (e.g., "Email already verified")
}
```

**Errors:**
- `"User not found"` - Invalid user ID
- `"Too many requests. Please try again in 15 minutes."` - Rate limit exceeded

**Example:**
```typescript
await requestEmailVerification({ userId: user._id });
toast.success("Verification code sent! Check your email.");
```

**Notes:**
- Automatically checks if email is already verified
- Rate limited to 3 requests per 15 minutes
- Calls `sendVerificationCode` internally

---

## Email API

All email functions are in `convex/emails.ts`.

### sendWelcomeEmail

Sends a welcome email to new users.

**Type:** `action`

**Arguments:**
```typescript
{
  userId: Id<"users">; // User's ID
  email: string;       // User's email address
  name: string;        // User's display name
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;  // Resend message ID if successful
}
```

**Example:**
```typescript
await ctx.runAction(api.emails.sendWelcomeEmail, {
  userId: user._id,
  email: user.email,
  name: user.name
});
```

**Notes:**
- Logs attempt in emailLogs table
- Type: "welcome"
- Currently sends basic HTML email (customize as needed)

---

### sendVerificationEmail

Sends email verification code to user.

**Type:** `action`

**Arguments:**
```typescript
{
  email: string;           // User's email address
  name: string;            // User's display name
  code: string;            // 6-digit OTP code
  userId?: Id<"users">;    // Optional user ID for logging
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;
}
```

**Example:**
```typescript
await ctx.runAction(api.emails.sendVerificationEmail, {
  email: "user@example.com",
  name: "John Doe",
  code: "123456",
  userId: user._id
});
```

**Notes:**
- Email includes OTP code in body
- Subject: "Verify Your Email Address"
- Type: "verification"
- Code expires in 15 minutes

---

### sendPasswordResetEmail

Sends password reset code to user.

**Type:** `action`

**Arguments:**
```typescript
{
  email: string;       // User's email address
  name: string;        // User's display name
  code: string;        // 6-digit OTP code
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;
}
```

**Example:**
```typescript
await ctx.runAction(api.emails.sendPasswordResetEmail, {
  email: "user@example.com",
  name: "John Doe",
  code: "123456"
});
```

**Notes:**
- Email includes OTP code and reset instructions
- Subject: "Reset Your Password"
- Type: "reset"
- Code expires in 15 minutes

---

### sendLoginAlert

Sends login notification to user.

**Type:** `action`

**Arguments:**
```typescript
{
  email: string;       // User's email address
  name: string;        // User's display name
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;
}
```

**Example:**
```typescript
await ctx.runAction(api.emails.sendLoginAlert, {
  email: user.email,
  name: user.name
});
```

**Notes:**
- Optional security feature (not enabled by default)
- Alerts user of login activity
- Type: "login_alert"
- Useful for detecting unauthorized access

---

### logEmail (Internal)

Internal mutation for logging email attempts.

**Type:** `internalMutation`

**Arguments:**
```typescript
{
  to: string;               // Recipient email
  subject: string;          // Email subject
  status: "sent" | "failed"; // Email status
  userId?: Id<"users">;     // Optional user ID
  type: string;             // Email type (welcome, verification, reset, login_alert)
  errorMessage?: string;    // Error message if failed
}
```

**Notes:**
- Called automatically by all email sending functions
- Creates audit trail in emailLogs table
- Used for debugging and monitoring

---

## OTP API

All OTP functions are in `convex/otp.ts`.

### sendVerificationCode

Generates and sends email verification OTP.

**Type:** `action`

**Arguments:**
```typescript
{
  email: string;           // User's email address
  name: string;            // User's display name
  userId?: Id<"users">;    // Optional user ID
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;      // Resend message ID
}
```

**Errors:**
- `"Too many requests. Please try again in 15 minutes."` - Rate limit exceeded

**Example:**
```typescript
await sendVerificationCode({
  email: "user@example.com",
  name: "John Doe",
  userId: user._id
});
```

**Notes:**
- Generates 6-digit code automatically
- Rate limited: 3 requests per 15 minutes
- Creates OTP with type "email_verification"
- Expires in 15 minutes
- Calls `sendVerificationEmail` to deliver code

---

### sendPasswordResetCode

Generates and sends password reset OTP.

**Type:** `action`

**Arguments:**
```typescript
{
  email: string;       // User's email address
}
```

**Returns:**
```typescript
{
  success: boolean;
  messageId?: string;
}
```

**Errors:**
- `"No account found with this email"` - Email not registered
- `"Too many requests. Please try again in 15 minutes."` - Rate limit exceeded

**Example:**
```typescript
await sendPasswordResetCode({
  email: "user@example.com"
});
```

**Notes:**
- Verifies user exists before sending
- Generates 6-digit code automatically
- Rate limited: 3 requests per 15 minutes
- Creates OTP with type "password_reset"
- Expires in 15 minutes

---

### verifyCode

Verifies an OTP code.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;    // User's email address
  code: string;     // 6-digit OTP code
  type: "email_verification" | "password_reset" | "login_2fa"; // OTP type
}
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;           // Error message if failed
  userId?: Id<"users">;     // User ID if successful
}
```

**Errors (in response, not thrown):**
- `"OTP has expired"` - Code older than 15 minutes
- `"Too many invalid attempts"` - 5 failed attempts reached
- `"Invalid OTP code"` - Code doesn't match

**Example:**
```typescript
const result = await verifyCode({
  email: "user@example.com",
  code: "123456",
  type: "email_verification"
});

if (result.success) {
  console.log("Verified! User ID:", result.userId);
} else {
  console.error("Verification failed:", result.error);
}
```

**Notes:**
- Does not throw errors, returns them in response
- Increments attempt counter on failure
- Marks OTP as used on success
- Max 5 attempts per code
- Finds most recent unused OTP for email/type

---

### createOTP (Internal)

Internal mutation for creating OTP codes.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;
  code: string;
  type: "email_verification" | "password_reset" | "login_2fa";
  expiresAt: number;        // Unix timestamp
  userId?: Id<"users">;
}
```

**Notes:**
- Called internally by sendVerificationCode and sendPasswordResetCode
- Creates entry in otpCodes table
- Sets used: false, attempts: 0

---

### checkOTPRateLimit (Internal)

Internal mutation for rate limiting.

**Type:** `mutation`

**Arguments:**
```typescript
{
  email: string;
  type: string;
}
```

**Errors:**
- `"Too many requests. Please try again in 15 minutes."` - Limit exceeded

**Notes:**
- Checks for 3+ OTP requests in past 15 minutes
- Called automatically before generating new OTPs

---

### cleanupExpiredOTPs

Removes expired OTP codes from database.

**Type:** `internalMutation`

**Arguments:** None

**Notes:**
- Called by cron job every 15 minutes
- Deletes OTPs older than current time
- Helps maintain database performance

---

### cleanupOldEmailLogs

Removes old email logs from database.

**Type:** `internalMutation`

**Arguments:** None

**Notes:**
- Called by cron job daily at 2 AM UTC
- Deletes email logs older than 90 days
- Configurable retention period

---

## Schema Reference

### users

User account table.

```typescript
{
  email: string;                    // Unique email address
  passwordHash: string;             // bcrypt hashed password
  name: string;                     // Display name
  role?: string;                    // "admin" | "user" (default: "user")
  emailVerified?: boolean;          // Email verification status (default: false)
  twoFactorEnabled?: boolean;       // 2FA enabled flag (default: false)
  createdAt: number;                // Unix timestamp
}
```

**Indexes:**
- `by_email` - Efficient user lookup by email
- `by_verified` - Query verified/unverified users

---

### emailLogs

Email sending audit trail.

```typescript
{
  to: string;                       // Recipient email
  subject: string;                  // Email subject
  status: "sent" | "failed";        // Email status
  sentAt: number;                   // Unix timestamp
  userId?: Id<"users">;             // Optional user ID
  type: string;                     // "welcome" | "verification" | "reset" | "login_alert"
  errorMessage?: string;            // Error message if failed
}
```

**Indexes:**
- `by_user` - Find all emails sent to a user
- `by_type` - Query emails by type
- `by_status` - Find failed emails

---

### otpCodes

OTP code storage.

```typescript
{
  userId?: Id<"users">;             // Optional user ID
  email: string;                    // User's email
  code: string;                     // 6-digit code
  type: "email_verification" | "password_reset" | "login_2fa";
  expiresAt: number;                // Unix timestamp
  used: boolean;                    // Whether code has been used
  attempts?: number;                // Failed verification attempts
  createdAt: number;                // Unix timestamp
}
```

**Indexes:**
- `by_email_and_type` - Find OTP by email and type
- `by_expires` - Efficient cleanup of expired OTPs
- `by_user` - Find all OTPs for a user

---

## Types

### Common Types

```typescript
// User ID type
type UserId = Id<"users">;

// OTP types
type OTPType = "email_verification" | "password_reset" | "login_2fa";

// Email status
type EmailStatus = "sent" | "failed";

// User role
type UserRole = "admin" | "user";

// Auth view state (frontend)
type AuthView = "signin" | "verify-email" | "forgot-password" | "reset-password";
```

### Function Return Types

```typescript
// Sign up/sign in result
interface AuthResult {
  userId: Id<"users">;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

// Email sending result
interface EmailResult {
  success: boolean;
  messageId?: string;
}

// OTP verification result
interface VerifyResult {
  success: boolean;
  error?: string;
  userId?: Id<"users">;
}

// Generic success result
interface SuccessResult {
  success: boolean;
  message?: string;
}
```

### Frontend Types

```typescript
// Sign in form props
interface SignInFormProps {
  onSignIn: (userId: Id<"users">) => void;
  onForgotPassword?: () => void;
}

// Verify email props
interface VerifyEmailProps {
  userId: Id<"users">;
  email: string;
  onVerified: () => void;
}

// Forgot password props
interface ForgotPasswordProps {
  onCodeSent: (email: string) => void;
  onBack: () => void;
}

// Reset password props
interface ResetPasswordProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

// OTP input props
interface OTPInputProps {
  length?: number;              // Number of digits (default: 6)
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

// Verification banner props
interface VerificationBannerProps {
  userId: Id<"users">;
  onVerifyClick: () => void;
}
```

---

## Error Handling

### Backend Errors

Backend functions throw errors that should be caught and displayed to users:

```typescript
try {
  await signIn({ email, password });
} catch (error) {
  const message = error instanceof Error
    ? error.message
    : "Could not complete request";
  toast.error(message);
}
```

### Common Error Messages

- `"Email already registered"` - Signup with existing email
- `"Invalid email or password"` - Sign in failure
- `"User not found"` - Invalid user ID
- `"Invalid verification code"` - Wrong OTP
- `"Verification code has expired"` - OTP older than 15 minutes
- `"Too many requests. Please try again in 15 minutes."` - Rate limit
- `"Too many invalid attempts"` - OTP attempt limit reached
- `"No account found with this email"` - Password reset for non-existent user

### Frontend Validation

Always validate inputs before making API calls:

```typescript
// Email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password validation
const isValidPassword = (password: string) => {
  return password.length >= 8;
};

// OTP validation
const isValidOTP = (code: string) => {
  return /^\d{6}$/.test(code);
};
```

---

## Rate Limits

- **OTP Requests**: 3 per 15 minutes per email
- **OTP Attempts**: 5 per code
- **OTP Expiration**: 15 minutes
- **Email Log Retention**: 90 days (configurable)

---

## Environment Variables

Required for full functionality:

```bash
# Convex
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Resend (for emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Optional Configuration
OTP_EXPIRY_MINUTES=15
MAX_OTP_ATTEMPTS=5
MAX_OTP_REQUESTS=3
```

See [SETUP.md](./SETUP.md) for setup instructions.
