# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chef is an AI-powered full-stack web app builder that specializes in building applications with Convex backends. It generates complete applications with database, authentication, real-time features, and deployment capabilities. This is a fork of bolt.diy with significant Convex-specific enhancements.

**Core Architecture:**
- **Frontend**: Remix-based React application running on Vite
- **Backend**: Convex (reactive database with serverless functions)
- **Agent System**: AI-powered code generation loop in `chef-agent/`
- **Runtime**: WebContainer API for in-browser code execution
- **Template**: Starting project template in `template/`

## Common Commands

### Development
```bash
# Install dependencies (uses pnpm)
pnpm i

# Start frontend dev server (Terminal 1)
pnpm run dev
# Access at http://127.0.0.1:5173 (NOT localhost!)

# Start Convex backend (Terminal 2)
npx convex dev

# Run tests
pnpm run test
pnpm run test:watch  # Watch mode

# Linting and formatting
pnpm run lint        # Check all
pnpm run lint:fix    # Auto-fix all
pnpm run typecheck   # TypeScript check
```

### Claude Code Integration
Chef can use Claude Code CLI as its AI engine instead of API calls. Enable with:
```bash
export USE_CLAUDE_AGENT_SDK=1  # in .env.local
./scripts/verify-claude-code-setup.sh
```

See ARCHITECTURE.md for detailed integration architecture.

### Project Template
```bash
# Rebuild the bootstrap template snapshot
npm run rebuild-template
```

### Testing
```bash
# Run single test file
npx vitest run path/to/test.spec.ts

# Run tests for specific package
cd chef-agent && pnpm test
cd convex && pnpm test
```

## Architecture

### High-Level Flow
```
User Prompt → Remix Backend → AI Agent Loop → WebContainer → UI
                      ↓
                Convex Backend (database, auth, functions)
```

### Key Directories

**`app/`** - Remix application (client + serverless APIs)
- `components/` - React UI components (chat interface, workbench, editor)
- `lib/.server/` - Server-side logic (LLM providers, chat handling)
- `lib/stores/` - Nanostores for client state management
- `routes/` - Remix routes (pages and API endpoints)
- `lib/webcontainer/` - WebContainer integration

**`chef-agent/`** - Agentic AI loop
- `prompts/` - System prompts that define Chef's behavior
  - `system.ts` - Main system prompt assembly
  - `convexGuidelines.ts` - Convex-specific coding rules
  - `solutionConstraints.ts`, `formattingInstructions.ts`, etc.
- `tools/` - AI tools available to the agent
  - `edit.ts` - File editing (smart diff-based edits)
  - `view.ts` - File reading
  - `deploy.ts` - Convex deployment
  - `npmInstall.ts` - Dependency installation
  - `lookupDocs.ts` - Documentation search
  - `addEnvironmentVariables.ts` - Env var management
- `message-parser.ts` - Parses AI responses for tool calls
- `ChatContextManager.ts` - Manages conversation context and token limits

**`convex/`** - Backend database and functions
- `schema.ts` - Database schema (chats, messages, users, sessions)
- `messages.ts` - Chat message storage and retrieval
- `sessions.ts` - User session management
- `share.ts` - Project sharing functionality
- `deploy.ts` - Deployment orchestration

**`template/`** - Bootstrap project template
- Contains starter files for all generated projects
- Includes Convex setup, React + Vite config, auth boilerplate

**`test-kitchen/`** - Evaluation harness for Chef
- `chefTask.ts` - Task definitions for testing
- `chefScorer.ts` - Scoring logic for evaluations

### State Management

Uses **Nanostores** for reactive client state:
- `app/lib/stores/messages.ts` - Chat messages
- `app/lib/stores/files.ts` - File system state
- `app/lib/stores/workbench.client.ts` - Workbench UI state
- `app/lib/stores/terminal.ts` - Terminal state
- `app/lib/stores/convexProject.ts` - Convex project connection

### Message Flow

1. User types in chat → `MessageInput.tsx`
2. Message sent to `/api/chat` → `app/routes/api.chat.ts`
3. Agent loop processes in `app/lib/.server/llm/convex-agent.ts`
4. AI generates tool calls (edit, view, deploy, etc.)
5. Tools execute via `chef-agent/tools/*`
6. Results stream back to UI via Server-Sent Events (SSE)
7. Files sync to WebContainer → `app/lib/webcontainer/`

### WebContainer Integration

Chef uses WebContainer API to run Node.js in the browser:
- Files created by AI → synced to WebContainer filesystem
- Terminal commands → executed in WebContainer shell
- Preview server → runs in WebContainer (e.g., `npm run dev`)

File sync happens in `app/lib/.server/webcontainer-sync.ts` and `app/lib/webcontainer/index.ts`.

## Convex-Specific Patterns

### Function Registration
Always use the new function syntax with validators:
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { name: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

### Calling Functions
```typescript
// In same file - add type annotation
const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });

// Internal functions use `internal` object
await ctx.runAction(internal.example.privateAction, {});
```

### Schema Design
- Define in `convex/schema.ts`
- Index naming: include all fields (e.g., `by_field1_and_field2`)
- System fields: `_id`, `_creationTime` (automatic)

### Tools Available to AI
Chef's AI has access to specialized tools:
- **edit** - Modify files with intelligent diffs
- **view** - Read file contents
- **deploy** - Deploy Convex backend
- **npmInstall** - Install packages
- **lookupDocs** - Search Convex documentation
- **addEnvironmentVariables** - Add env vars to Convex deployment
- **getConvexDeploymentName** - Get deployment info

When using Claude Code SDK mode, these are replaced by Claude Code's native tools (Read, Write, Edit, Bash).

## Environment Variables

Required in `.env.local`:
```bash
# Convex (required)
CONVEX_DEPLOYMENT=dev:project-name-123
VITE_CONVEX_URL=https://project.convex.cloud

# Model provider API keys (at least one required)
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
XAI_API_KEY=...

# Auth (required for local dev)
VITE_WORKOS_CLIENT_ID=client_...
VITE_WORKOS_REDIRECT_URI=http://127.0.0.1:5173
VITE_WORKOS_API_HOSTNAME=apiauth.convex.dev

# Optional: Claude Code integration
USE_CLAUDE_AGENT_SDK=1
```

Get environment variables from Vercel:
```bash
npx vercel env pull
```

## Testing & Quality

### Running Tests
```bash
# All tests
pnpm test

# Specific package
pnpm --filter chef-agent test
pnpm --filter convex test

# Watch mode
pnpm test:watch
```

### Code Quality
Before submitting PRs:
```bash
pnpm run lint:fix    # Auto-fix linting issues
pnpm run typecheck   # TypeScript check
pnpm run test        # Run tests
```

Commit queue blocks on: tests, formatting (prettier), lints (eslint), and typechecking.

## Deployment

### Deploy to Staging
```bash
git checkout main
git pull
git push origin main:staging
```

### Deploy to Production
1. Create PR from `staging` to `release`
2. Wait for evals to complete (~10 mins)
3. Verify 100% success rate on evals
4. Manually test staging environment
5. Merge to release:
```bash
git checkout staging
git pull
git push origin staging:release
```

## Important Conventions

### File System
- Use **pnpm** (not npm/yarn)
- Node.js version 20 for development
- Access dev server at `http://127.0.0.1:5173` (NOT `localhost`)

### Code Style
- ESLint for JavaScript/TypeScript
- Prettier for markdown
- Use file-based routing in `convex/` directory
- Prefer internal functions (`internalQuery`, `internalMutation`) for private APIs

### Convex Function Guidelines
- Always include `args` and `returns` validators
- Use `v.null()` for functions that don't return a value
- Use `v.id(tableName)` for document IDs
- System fields (`_id`, `_creationTime`) are automatic
- Never use `ctx.db` in actions (actions don't have DB access)
- For Node.js built-ins in actions, add `"use node";` at top of file

### Message Compression
Chat messages use LZ4 compression for storage:
- `app/lib/compression.server.ts` - Server-side compression
- `app/lib/compression.client.ts` - Client-side decompression
- Stored in `_storage` table, referenced in `chatMessagesStorageState`

## Debugging

### Global Debug Variables (Browser Console)
```javascript
chefWebContainer        // WebContainer instance
chefMessages            // Raw chat messages
chefParsedMessages      // Parsed messages
chefSentryEnabled       // Sentry status
chefSetLogLevel("debug") // Set log level (debug/info/tracing)
chefAssertAdmin()       // Enable admin features (Convex team only)
```

### Admin Features
- `/admin/prompt-debug` - View prompts sent to LLMs
- `/admin/usage-breakdown` - Token usage analytics

### Checking Integration Status
```bash
./scripts/verify-claude-code-setup.sh   # Verify Claude Code integration
./scripts/toggle-claude-code.sh         # Toggle SDK mode on/off
```

### Logs
- Vite dev server logs → Terminal 1
- Convex backend logs → Terminal 2
- Browser console → F12 DevTools
- Source maps included in production

## Monorepo Structure

Uses pnpm workspaces:
- `chef-agent/` - Chef agent package
- `chefshot/` - CLI for interacting with Chef webapp
- `convex/` - Convex backend
- `mcp-server/` - MCP server (in progress)
- `slack-app/` - Example Slack app
- `template/` - Project template
- `test-kitchen/` - Evaluation harness

## Related Documentation

- **ARCHITECTURE.md** - Claude Code integration architecture
- **DEVELOPMENT.md** - Internal development workflow for Convex team
- **CONTRIBUTING.md** - Contribution guidelines
- **CLAUDE_CODE_INTEGRATION_GUIDE.md** - Slash commands and troubleshooting
- **.cursor/rules/convex_rules.mdc** - Comprehensive Convex coding guidelines with examples

## Project-Specific Notes

### Authentication Flow
- Users sign in with Convex accounts via WorkOS
- Session ID stored in localStorage (unguessable UUID)
- Team selection for project provisioning
- OAuth flow for Convex project access

### Chat Storage
- Chats have two IDs: `initialId` (UUID) and `urlId` (human-friendly)
- Messages compressed with LZ4 and stored in `_storage`
- Snapshots for sharing/forking at specific points
- Subchats for branching conversations

### Claude Code as Engine
When `USE_CLAUDE_AGENT_SDK=1`, Chef spawns Claude Code CLI:
- Each chat gets isolated directory: `/tmp/chef-projects/<chatId>/`
- Claude Code uses native tools (Read, Write, Edit, Bash)
- Files sync back to WebContainer
- Saves API costs for Pro users

See ARCHITECTURE.md for complete flow diagrams.
