# Authentication Setup Guide

This template comes with Convex Auth pre-configured with email/password authentication.

## Default Admin Credentials

For initial setup and testing, use these credentials:

```
Email: admin@example.com
Password: admin123
```

## First-Time Setup

### 1. Start the Development Server

```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Convex).

### 2. Sign Up with Admin Credentials

1. Navigate to your app in the browser
2. Click "Sign Up" (not "Sign In")
3. Enter the admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Sign Up"

### 3. Promote User to Admin

After signing up, you need to manually promote this user to admin role:

**Option A: Using Convex Dashboard**
1. Go to https://dashboard.convex.dev
2. Open your project
3. Go to the "Data" tab
4. Find the `users` table
5. Find the user with email `admin@example.com`
6. Edit the document and add a field:
   - Field name: `role`
   - Value: `"admin"`
7. Save

**Option B: Using the mutation (if available)**
Open the Convex dashboard functions tab and run:
```typescript
api.seed.makeUserAdmin()
```

### 4. Sign Out and Sign In Again

After promoting to admin, sign out and sign in again for the role to take effect.

## Authentication Features

### Available Providers

- **Email/Password**: Primary authentication method
- **Google OAuth**: Social sign-in (requires setup)
- **Anonymous**: Guest access

### User Roles

- **user** (default): Regular user access
- **admin**: Full administrative access

### Checking User Role in Code

**Frontend (React):**
```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  const currentUser = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.auth.isAdmin);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
```

**Backend (Convex):**
```typescript
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const myAdminMutation = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if ((user as any).role !== "admin") {
      throw new Error("Admin access required");
    }

    // Admin-only logic here
  },
});
```

## Security Notes

🔒 **IMPORTANT**: Change the admin password after first login!

1. Create a password change mutation
2. Or manually update in the database
3. Never commit real credentials to version control

## Customization

### Add More Roles

Edit `convex/auth.ts` to support more roles:
```typescript
type UserRole = "user" | "admin" | "moderator" | "editor";
```

### Add Profile Fields

Extend the user object in your queries:
```typescript
return {
  _id: user._id,
  email: user.email,
  name: user.name,
  role: user.role || "user",
  avatar: user.avatar,
  bio: user.bio,
  // Add more fields as needed
};
```

## Troubleshooting

**Q: Sign in fails with "Could not sign in"**
A: Make sure you signed up first. Use "Sign Up" to create the account.

**Q: I forgot the admin password**
A: Delete the user from the Convex dashboard and sign up again.

**Q: Role changes don't take effect**
A: Sign out and sign back in for role updates to propagate.

**Q: Google OAuth not working**
A: You need to configure Google OAuth credentials in your Convex project settings.

## Next Steps

- Add password reset functionality
- Implement email verification
- Add profile management
- Configure OAuth providers
- Set up role-based access control (RBAC)
