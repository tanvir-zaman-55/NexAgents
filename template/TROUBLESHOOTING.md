# Troubleshooting Guide

Comprehensive solutions for common issues with authentication, email delivery, and OTP verification.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Email Delivery Issues](#email-delivery-issues)
3. [OTP Verification Issues](#otp-verification-issues)
4. [Convex Backend Issues](#convex-backend-issues)
5. [Frontend Issues](#frontend-issues)
6. [Database Issues](#database-issues)
7. [Environment & Configuration](#environment--configuration)
8. [Production Issues](#production-issues)

## Authentication Issues

### Cannot Sign Up - "Email already registered"

**Problem:** Getting error when trying to sign up with an email.

**Causes:**
1. Email already exists in database
2. Previous incomplete signup

**Solutions:**

**Option A: Use Different Email**
```typescript
// Try signing up with a different email
```

**Option B: Delete Existing User**
1. Go to Convex Dashboard > Data > `users` table
2. Find user with that email
3. Click the document > Delete
4. Try signing up again

**Option C: Sign In Instead**
- If account already exists, click "Sign in" instead of "Sign up"

---

### Cannot Sign In - "Invalid email or password"

**Problem:** Sign in fails even with correct credentials.

**Causes:**
1. Haven't signed up yet (need to sign up first)
2. Wrong password (case-sensitive)
3. Wrong email (typo)
4. User deleted from database

**Solutions:**

**Step 1: Verify Account Exists**
1. Check Convex Dashboard > Data > `users` table
2. Search for your email
3. If not found, you need to sign up first

**Step 2: Password Check**
- Passwords are case-sensitive
- Check for extra spaces
- Ensure Caps Lock is off

**Step 3: Reset Password**
- Click "Forgot Password?"
- Follow password reset flow
- Set new password

**Step 4: Check Browser Console**
```javascript
// Open DevTools Console (F12)
// Look for error messages
// Check Network tab for failed requests
```

---

### Admin Role Not Working

**Problem:** Logged in but not seeing AdminDashboard.

**Causes:**
1. Role not set to "admin"
2. Need to sign out and sign in again
3. Wrong admin email configuration

**Solutions:**

**Step 1: Verify Role in Database**
1. Convex Dashboard > Data > `users` table
2. Find your user document
3. Check `role` field
4. Should be `"admin"` (string, not object)

**Step 2: Update Role if Needed**
```json
{
  "_id": "...",
  "email": "admin@example.com",
  "role": "admin"  // Add this field if missing
}
```

**Step 3: Sign Out and Sign In**
- Role changes only take effect after re-authentication
- Click sign out button
- Sign in again
- Should now see AdminDashboard

**Step 4: Check Admin Email Configuration**
```typescript
// convex/simpleAuth.ts
role: args.email === "admin@example.com" ? "admin" : "user"
// Make sure email matches exactly
```

---

### Session Lost on Page Refresh

**Problem:** User signed out when refreshing page.

**Causes:**
1. localStorage not persisting
2. User ID not being loaded on mount
3. Browser privacy mode

**Solutions:**

**Check localStorage:**
```javascript
// Open DevTools Console
console.log(localStorage.getItem("userId"));
// Should return a user ID string
```

**Verify App.tsx Implementation:**
```typescript
// src/App.tsx should have:
useEffect(() => {
  const savedUserId = localStorage.getItem("userId");
  if (savedUserId) {
    setUserId(savedUserId as Id<"users">);
  }
}, []);
```

**Browser Privacy Mode:**
- localStorage doesn't work in private/incognito mode
- Use regular browser window
- Check browser privacy settings

---

## Email Delivery Issues

### Emails Not Sending

**Problem:** No emails received after requesting verification code or password reset.

**Causes:**
1. Resend API key not configured
2. Invalid FROM email address
3. Domain not verified
4. Emails going to spam
5. Rate limit exceeded

**Solutions:**

**Step 1: Check Resend Configuration**
1. Convex Dashboard > Settings > Environment Variables
2. Verify `RESEND_API_KEY` exists
3. Verify `RESEND_FROM_EMAIL` is correct

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
# Or for testing:
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Step 2: Check Email Logs**
1. Convex Dashboard > Data > `emailLogs` table
2. Find recent email attempts
3. Check `status` field:
   - `"sent"` = successful
   - `"failed"` = check `errorMessage`

**Step 3: Verify Resend Domain**
1. Go to Resend Dashboard
2. Check Domains section
3. Ensure domain has green checkmark
4. Add DNS records if needed

**Step 4: Check Spam Folder**
- OTP emails might be filtered as spam
- Add sender to safe senders list
- Check spam/junk folder

**Step 5: Use Resend Test Domain**
For testing, use `onboarding@resend.dev`:
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```
- No DNS setup required
- Can only send to your registered Resend email

**Step 6: Check Rate Limits**
- Resend free tier: 100 emails/day, 3,000/month
- Check Resend Dashboard for quota
- Upgrade plan if needed

---

### Emails in Spam Folder

**Problem:** Emails consistently end up in spam.

**Causes:**
1. Domain not verified
2. Missing SPF/DKIM records
3. No DMARC policy
4. Suspicious email content

**Solutions:**

**Step 1: Verify Domain in Resend**
1. Add your domain in Resend
2. Add all DNS records:
   - SPF record
   - DKIM records (usually 2-3)
   - DMARC record

**Step 2: Check DNS Propagation**
```bash
# Check SPF record
dig TXT yourdomain.com | grep spf

# Check DKIM record
dig TXT resend._domainkey.yourdomain.com
```

**Step 3: Improve Email Content**
- Use clear subject lines
- Add text version (not just HTML)
- Include unsubscribe link
- Add physical address

**Step 4: Warm Up Domain**
- Start with small volumes
- Gradually increase sending
- Monitor spam complaints

---

## OTP Verification Issues

### "Invalid verification code"

**Problem:** OTP code not working even though it's correct.

**Causes:**
1. Code already used
2. Code expired (>15 minutes old)
3. Typo in code
4. Wrong email address
5. Multiple codes requested

**Solutions:**

**Step 1: Check OTP Table**
1. Convex Dashboard > Data > `otpCodes` table
2. Find OTPs for your email
3. Check most recent one:
   - `used`: should be `false`
   - `expiresAt`: should be > current time
   - `code`: compare with entered code

**Step 2: Request New Code**
- If code is expired or used
- Click "Resend code"
- Use the newest code

**Step 3: Check Code Entry**
- Codes are exactly 6 digits
- No spaces or dashes
- Case doesn't matter (all numbers)

**Step 4: Clear Old Codes**
```typescript
// Run this in Convex Dashboard Functions
await ctx.db
  .query("otpCodes")
  .withIndex("by_email_and_type", (q) =>
    q.eq("email", "user@example.com")
     .eq("type", "email_verification")
  )
  .collect()
  .then(codes => codes.forEach(code => ctx.db.delete(code._id)));
```

---

### "Too many requests" Error

**Problem:** Getting rate limit error when requesting OTP.

**Causes:**
1. Requested OTP 3+ times in 15 minutes
2. Old OTP requests still in database
3. Shared email testing by multiple users

**Solutions:**

**Step 1: Wait 15 Minutes**
- Rate limit resets after 15 minutes
- Check countdown timer on resend button

**Step 2: Clear Old OTP Requests**
1. Convex Dashboard > Data > `otpCodes`
2. Delete all entries for your email
3. Try requesting again

**Step 3: Check Rate Limit**
```typescript
// In Convex Dashboard Functions, run:
const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
const recentOTPs = await ctx.db
  .query("otpCodes")
  .withIndex("by_email_and_type", (q) =>
    q.eq("email", "user@example.com")
     .eq("type", "email_verification")
  )
  .filter((q) => q.gte(q.field("createdAt"), fifteenMinutesAgo))
  .collect();

console.log("Recent OTPs:", recentOTPs.length);
// Should be < 3 to allow new request
```

**Step 4: Adjust Rate Limit (Development Only)**
```bash
# In Convex Dashboard Environment Variables
MAX_OTP_REQUESTS=10  # Increase for testing
```

---

### "OTP has expired"

**Problem:** Code expired before could be used.

**Causes:**
1. More than 15 minutes since request
2. Slow email delivery
3. Time zone issues

**Solutions:**

**Step 1: Request New Code**
- Click "Resend code"
- Use new code immediately
- 15 minute timer resets

**Step 2: Check Email Delivery Speed**
1. Check `emailLogs` table
2. Look at `sentAt` timestamp
3. If delay > 1 minute, contact Resend support

**Step 3: Extend Expiration (if needed)**
```bash
# In Convex Dashboard Environment Variables
OTP_EXPIRY_MINUTES=30  # Extend to 30 minutes
```

**Step 4: Check System Time**
```javascript
// In browser console
console.log(new Date().getTime());
// Should match current time in milliseconds
```

---

### "Too many invalid attempts"

**Problem:** Locked out after entering wrong code multiple times.

**Causes:**
1. Entered wrong code 5+ times
2. Using old code
3. Typos in code entry

**Solutions:**

**Step 1: Request New Code**
- Old code is locked after 5 attempts
- Request fresh code
- New code has 5 fresh attempts

**Step 2: Reset Attempt Counter**
1. Convex Dashboard > Data > `otpCodes`
2. Find your OTP document
3. Edit document
4. Set `attempts` to `0`
5. Or delete and request new code

**Step 3: Use Copy-Paste**
- Copy code from email
- Paste into input field
- Reduces typo risk

---

## Convex Backend Issues

### Functions Not Deploying

**Problem:** Changes to Convex functions not showing up.

**Causes:**
1. TypeScript compilation errors
2. Convex dev server not running
3. Syntax errors in code
4. Schema mismatch

**Solutions:**

**Step 1: Check Convex Dev Server**
```bash
# Should be running in a terminal
npx convex dev

# If not running, start it
# Should see "Deployed successfully!"
```

**Step 2: Check for TypeScript Errors**
```bash
cd convex
npx tsc --noEmit

# Fix any errors shown
```

**Step 3: Check Convex Dashboard Logs**
1. Functions tab
2. Click on function
3. View error logs
4. Fix reported issues

**Step 4: Clear Cache and Restart**
```bash
# Stop Convex dev server (Ctrl+C)
rm -rf node_modules/.convex
npx convex dev
```

---

### Database Schema Errors

**Problem:** "Field not found" or schema validation errors.

**Causes:**
1. Schema not updated
2. Missing required fields
3. Type mismatch
4. Index not created

**Solutions:**

**Step 1: Verify Schema**
```typescript
// convex/schema.ts
users: defineTable({
  email: v.string(),
  passwordHash: v.string(),
  name: v.string(),
  role: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),  // Check this exists
  twoFactorEnabled: v.optional(v.boolean()),
  createdAt: v.number(),
})
```

**Step 2: Deploy Schema**
- Schema auto-deploys with `npx convex dev`
- Check terminal for schema validation errors
- Fix errors and save file

**Step 3: Update Existing Documents**
If schema changed, update old documents:
```typescript
// Run in Convex Dashboard Functions
const users = await ctx.db.query("users").collect();
for (const user of users) {
  if (user.emailVerified === undefined) {
    await ctx.db.patch(user._id, { emailVerified: false });
  }
}
```

---

## Frontend Issues

### "Module not found" Errors

**Problem:** Import errors when running frontend.

**Causes:**
1. Dependencies not installed
2. Wrong import paths
3. Missing package
4. Node modules corrupted

**Solutions:**

**Step 1: Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Step 2: Check Import Paths**
```typescript
// Correct:
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Wrong:
import { useQuery } from "@convex-dev/react";  // Old package
```

**Step 3: Verify Package in package.json**
```json
{
  "dependencies": {
    "convex": "^1.17.0",
    "react": "^18.3.1",
    "@convex-dev/resend": "^0.1.13",
    "resend": "^4.0.1"
  }
}
```

---

### Components Not Updating

**Problem:** UI not reflecting database changes.

**Causes:**
1. Not using reactive queries
2. useState not updating
3. Component not re-rendering
4. Cache issues

**Solutions:**

**Step 1: Use Convex Queries**
```typescript
// Correct - Automatically reactive:
const user = useQuery(api.simpleAuth.getUser, { userId });

// Wrong - Not reactive:
const [user, setUser] = useState(null);
```

**Step 2: Force Re-render**
```typescript
// Add key prop to force remount
<Component key={userId} />
```

**Step 3: Clear Browser Cache**
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear cache
DevTools > Application > Clear storage
```

---

## Database Issues

### Cannot Find User

**Problem:** Query returns null even though user exists.

**Causes:**
1. Wrong user ID
2. User deleted
3. Index not used correctly
4. Query filter issue

**Solutions:**

**Step 1: Verify User Exists**
1. Convex Dashboard > Data > `users` table
2. Search for email or ID
3. Copy exact ID value

**Step 2: Check Query**
```typescript
// By ID:
const user = await ctx.db.get(userId);
if (!user) console.log("User not found");

// By email:
const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .first();
```

**Step 3: Check Index**
```typescript
// Verify index exists in schema.ts
.index("by_email", ["email"])
```

---

### Duplicate User Creation

**Problem:** Same email can sign up multiple times.

**Causes:**
1. Missing uniqueness check
2. Race condition
3. Validation not working

**Solutions:**

**Step 1: Add Check to signUp**
```typescript
const existing = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", args.email))
  .first();

if (existing) {
  throw new Error("Email already registered");
}
```

**Step 2: Clean Up Duplicates**
```typescript
// Run in Convex Dashboard
const allUsers = await ctx.db.query("users").collect();
const emailMap = new Map();

for (const user of allUsers) {
  const existing = emailMap.get(user.email);
  if (existing) {
    // Keep oldest, delete newer
    const toDelete = user.createdAt > existing.createdAt ? user : existing;
    await ctx.db.delete(toDelete._id);
  } else {
    emailMap.set(user.email, user);
  }
}
```

---

## Environment & Configuration

### .env.local Not Loading

**Problem:** Environment variables not available.

**Causes:**
1. Wrong file location
2. Wrong variable prefix
3. Server not restarted
4. Using wrong env file

**Solutions:**

**Step 1: Verify File Location**
```bash
# Should be in project root:
/your-project/.env.local

# Not in:
/your-project/src/.env.local ❌
```

**Step 2: Use Correct Prefix**
```bash
# Frontend variables need VITE_ prefix:
VITE_CONVEX_URL=https://...
VITE_APP_NAME=MyApp

# Backend variables (Convex Dashboard) don't:
RESEND_API_KEY=re_...
```

**Step 3: Restart Servers**
```bash
# Changes require restart:
# Stop both servers (Ctrl+C)
# Restart Convex:
npx convex dev
# Restart Vite:
npm run dev
```

---

### API Keys Not Working

**Problem:** Resend API key invalid or not found.

**Causes:**
1. Not set in Convex Dashboard
2. Typo in API key
3. Using wrong environment
4. API key revoked

**Solutions:**

**Step 1: Verify in Convex Dashboard**
1. Settings > Environment Variables
2. Check `RESEND_API_KEY` exists
3. Should start with `re_`

**Step 2: Test API Key**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "you@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

**Step 3: Generate New Key**
1. Go to Resend Dashboard
2. API Keys > Create API Key
3. Copy key (won't be shown again)
4. Update in Convex Dashboard

---

## Production Issues

### Different Behavior in Production

**Problem:** Works in development but not production.

**Causes:**
1. Using development environment variables
2. Different Convex deployment
3. CORS issues
4. Cache issues

**Solutions:**

**Step 1: Check Environment**
```typescript
console.log("CONVEX_URL:", import.meta.env.VITE_CONVEX_URL);
// Should be production URL in prod
```

**Step 2: Deploy to Production**
```bash
# Deploy Convex backend
npx convex deploy --prod

# Update frontend env
VITE_CONVEX_URL=https://your-prod.convex.cloud

# Build and deploy frontend
npm run build
```

**Step 3: Check Production Variables**
1. Convex Dashboard
2. Switch to "Production" environment (top right)
3. Settings > Environment Variables
4. Add all variables (same as dev)

---

### CORS Errors in Production

**Problem:** API calls blocked by CORS policy.

**Causes:**
1. Wrong origin in Convex settings
2. Missing headers
3. HTTP instead of HTTPS

**Solutions:**

**Step 1: Configure Convex Origins**
1. Convex Dashboard > Settings > HTTP Actions
2. Add your production domain:
   ```
   https://yourapp.com
   https://www.yourapp.com
   ```

**Step 2: Use HTTPS**
- Convex requires HTTPS in production
- Ensure your frontend uses HTTPS
- Check hosting provider SSL settings

---

## Getting More Help

### Enable Debug Logging

```typescript
// Add to convex functions
console.log("Debug:", { variable: value });

// View in Convex Dashboard > Functions > Logs
```

### Check System Status

- Convex Status: [https://status.convex.dev](https://status.convex.dev)
- Resend Status: [https://resend.com/status](https://resend.com/status)

### Contact Support

- **Convex Discord**: [https://discord.gg/convex](https://discord.gg/convex)
- **Convex Support**: support@convex.dev
- **Resend Support**: [https://resend.com/support](https://resend.com/support)

### File a Bug Report

Include:
1. Exact error message
2. Steps to reproduce
3. Browser console logs
4. Convex function logs
5. Environment (dev/prod)
6. Expected vs actual behavior

---

## Preventive Measures

### Best Practices

1. **Always check email logs** after sending
2. **Test in development first** before deploying
3. **Monitor rate limits** regularly
4. **Keep dependencies updated**
5. **Use environment variables** for sensitive data
6. **Implement error boundaries** in React
7. **Add logging** to critical functions
8. **Test with multiple users** before launch
9. **Set up monitoring** for production
10. **Document custom changes**

### Regular Maintenance

```bash
# Weekly tasks:
- Check email delivery rates
- Review failed email logs
- Clean up expired OTPs
- Monitor user signups
- Check for errors in logs

# Monthly tasks:
- Update dependencies
- Review security settings
- Backup database
- Test all auth flows
- Review rate limits
```

---

**Still having issues?** Check [AUTH_GUIDE.md](./AUTH_GUIDE.md) for detailed flow documentation or [API.md](./API.md) for function reference.
