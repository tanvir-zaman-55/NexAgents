# Chef x Claude Code Integration Guide

## Overview

Chef is now integrated with Claude Code through custom slash commands! You can manage your Chef development workflow entirely from the Claude Code CLI.

## Available Commands

### `/chef-status`
Check the health of your Chef development environment.

```bash
/chef-status
```

This command verifies:
- ✅ Vite dev server is running on port 5173
- ✅ Convex dev process is active
- ✅ Convex deployment is healthy
- ✅ UI is accessible

### `/chef-new`
Start a new Chef project.

```bash
/chef-new
```

Opens the Chef UI and guides you through creating a new full-stack application with Convex backend.

### `/chef-deploy`
Deploy your Chef project to production.

```bash
/chef-deploy
```

Walks you through:
1. Deploying Convex backend (`npx convex deploy`)
2. Deploying frontend to your hosting platform
3. Verifying environment variables

### `/chef-fix-env`
Diagnose and fix environment variable issues.

```bash
/chef-fix-env
```

Helpful when you see errors like:
- "Failed to query environment variables (HTTP 404)"
- "Timeout waiting for Convex project connection"
- "Failed to setup Chef environment"

### `/chef-logs`
View application logs for debugging.

```bash
/chef-logs
```

Shows recent logs from:
- Vite dev server
- Convex backend
- Browser console (instructions)

## Quick Start

### 1. First Time Setup

```bash
# Start Chef services (in separate terminals)
pnpm run dev          # Terminal 1: Vite dev server
npx convex dev        # Terminal 2: Convex backend

# Check everything is working
/chef-status
```

### 2. Create Your First App

```bash
# Start a new project
/chef-new

# Follow the prompts in the Chef UI at http://127.0.0.1:5173
# Describe what you want to build
# Chef generates the code with Convex backend
```

### 3. Common Workflows

**Check status before starting work:**
```bash
/chef-status
```

**Fix environment issues:**
```bash
/chef-fix-env
```

**View logs when debugging:**
```bash
/chef-logs
```

**Deploy to production:**
```bash
/chef-deploy
```

## Architecture

Chef + Claude Code integration works as follows:

```
┌──────────────────┐
│   Claude Code    │  ← You interact here
│   (Terminal)     │
└────────┬─────────┘
         │ Slash commands
         │
┌────────▼──────────────────────────────┐
│  Chef Web UI (http://127.0.0.1:5173)  │
│  ├─ React/Remix frontend              │
│  ├─ WebContainer (code execution)     │
│  └─ Chef Agent Loop                   │
└────────┬──────────────────────────────┘
         │
┌────────▼──────────┐
│  Convex Backend   │
│  ├─ Database      │
│  ├─ Functions     │
│  ├─ Auth          │
│  └─ File Storage  │
└───────────────────┘
```

## Troubleshooting

### "Command not found" Error

Make sure you're in the Chef project directory:
```bash
cd /path/to/chef
```

### "Failed to query environment variables (HTTP 404)"

This error has been fixed! The code now includes proper error handling. If you still see it:

1. Run `/chef-fix-env` to diagnose
2. Restart Convex dev: `pkill -f "convex dev" && npx convex dev`
3. Clear browser cache and reload

### Services Not Running

Check if services are running:
```bash
/chef-status
```

Start them if needed:
```bash
# Terminal 1
pnpm run dev

# Terminal 2
npx convex dev
```

## Advanced: MCP Server (Future)

We've laid the groundwork for a full MCP (Model Context Protocol) server integration in the `/mcp-server` directory. This will enable:

- Chef as a tool server for any MCP client
- Direct Convex backend integration
- Agent loop execution via MCP tools

Status: **In Progress** (basic structure created, implementation pending)

## What Got Fixed

### Error Handling in Container Setup

The original error you encountered was fixed in `app/lib/stores/startup/useContainerSetup.ts`:

```typescript
// OLD: Would crash on HTTP 404
await initializeConvexAuth(convexProject);

// NEW: Gracefully handles errors
try {
  await initializeConvexAuth(convexProject);
} catch (error: any) {
  console.warn('Warning: Failed to initialize Convex Auth:', error.message);
}
```

This prevents the "Failed to setup Chef environment" error from crashing your app.

## Next Steps

1. ✅ Use slash commands for common Chef operations
2. 🔄 (Optional) Complete MCP server for deeper integration
3. 🔄 (Optional) Add more slash commands as needed

## Support

- **Docs**: https://docs.convex.dev/chef
- **Issues**: https://github.com/get-convex/chef/issues
- **Discord**: https://discord.gg/convex

Happy building with Chef + Claude Code! 🧑‍🍳
