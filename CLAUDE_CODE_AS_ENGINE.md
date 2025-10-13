# Using Claude Code as Chef's AI Engine

## Overview

Instead of Chef making API calls to Anthropic/OpenAI/Google, you can configure it to use **Claude Code** (the CLI) as the AI engine. This means:

- ✅ **No API costs** - Uses your Claude Pro subscription
- ✅ **Better tooling** - Claude Code has superior file operations, bash execution, and context management
- ✅ **Local execution** - Code generation happens via your authenticated CLI
- ✅ **Same Chef UX** - Web UI stays the same, but Claude Code does the work behind the scenes

## Architecture

```
┌─────────────────────────┐
│   Chef Web UI           │
│   (User types prompt)   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Chef Backend          │
│   (Remix + Convex)      │
└──────────┬──────────────┘
           │
           │ Instead of: streamText(anthropic(...))
           │ Use: Claude Agent SDK
           │
           ▼
┌─────────────────────────┐
│  @anthropic-ai/         │
│  claude-agent-sdk       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   Claude Code CLI       │
│   (Your Pro account)    │
│   • Read/Write/Edit     │
│   • Bash execution      │
│   • Grep/Glob search    │
│   • WebFetch/Search     │
└─────────────────────────┘
```

## Prerequisites

1. **Claude Pro subscription** (required)
2. **Claude Code CLI installed**:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
3. **Authenticated with Claude Code**:
   ```bash
   claude auth login
   ```

## Setup

### 1. Enable Claude Code Integration

Add this to your `.env.local`:

```bash
USE_CLAUDE_AGENT_SDK=1
```

### 2. Verify Claude CLI is Found

The integration will automatically find your Claude CLI installation. Check the logs when starting Chef to see:

```
🚀 [SDK] Found Claude CLI at: /home/laith/.nvm/versions/node/v20.19.0/bin/claude
```

### 3. Start Chef with Claude Code

```bash
# Terminal 1: Start backend
npx convex dev

# Terminal 2: Start frontend
pnpm run dev
```

### 4. Use Chef Normally

Open http://127.0.0.1:5173 and start chatting. When you select **Anthropic** as the provider, Chef will use Claude Code instead of making API calls.

## How It Works

### Message Flow

1. **User types in Chef UI**: "Build me a todo app with auth"
2. **Chef backend receives prompt** via `/api/chat`
3. **Checks `USE_CLAUDE_AGENT_SDK=1`** → routes to `convexAgentWithSDK()`
4. **Claude Agent SDK spawns Claude Code CLI** with:
   - Your prompt
   - Working directory set to Chef project
   - All tools enabled (Read, Write, Edit, Bash, etc.)
   - Non-interactive mode (`--dangerously-skip-permissions`)
5. **Claude Code generates code** using its tools
6. **Results stream back** to Chef UI
7. **User sees generated code** in the web interface

### Code Location

- **Integration entry point**: `app/lib/.server/llm/convex-agent.ts:79-84`
- **SDK wrapper**: `app/lib/.server/llm/claude-agent-sdk.ts`
- **CLI detection**: `claude-agent-sdk.ts:7-39` (auto-finds `claude` binary)

### Tools Available

Claude Code has access to:
- `Read` - Read files in the project
- `Write` - Create new files
- `Edit` - Modify existing files
- `Bash` - Execute shell commands
- `Grep` - Search file contents
- `Glob` - Find files by pattern
- `WebFetch` - Fetch documentation
- `WebSearch` - Search the web
- `TodoWrite` - Track progress

## Configuration Options

### Model Selection

By default, uses `claude-sonnet-4-5`. Override by selecting a model in Chef UI settings.

### Max Turns

Set in `claude-agent-sdk.ts:87`:
```typescript
maxTurns: 50,  // Maximum agentic turns
```

### Working Directory

**IMPORTANT**: Each chat gets its own isolated project directory!

When you start a chat in Chef:
1. A temporary directory is created: `/tmp/chef-projects/<chatInitialId>`
2. Claude Code works in this directory (not Chef's main directory!)
3. Files created by Claude Code appear in this isolated space
4. Changes stream back to Chef and sync to WebContainer

**Example**:
```
Chat 1 (ID: abc123): /tmp/chef-projects/abc123/
Chat 2 (ID: def456): /tmp/chef-projects/def456/
```

This means:
- ✅ Multiple chats can run simultaneously without conflicts
- ✅ Each project has its own dependencies and files
- ✅ Claude Code sees a clean project structure
- ⚠️  Files exist both in temp directory AND in WebContainer (browser)

### Permissions

Uses `--dangerously-skip-permissions` for non-interactive mode. This is **safe** in Chef's sandboxed environment but be aware of what Chef/Claude Code can access.

## Debugging

### Enable Detailed Logging

Look for these console logs:

```bash
🚀 [SDK] Starting Claude Agent SDK
🚀 [SDK] Total messages: 3
🚀 [SDK] Model choice: claude-sonnet-4-5
🚀 [SDK] CWD: /path/to/chef
🚀 [SDK] Found Claude CLI at: /path/to/claude
📨 [SDK] Message #1: system
💬 [SDK] Assistant message content preview: ...
✅ [SDK] Completed! Total messages: 15
```

### Check Claude CLI Path

If it fails to find Claude:

```bash
which claude
# Should output: /path/to/claude

# Or install globally:
npm install -g @anthropic-ai/claude-code
```

### Verify Authentication

```bash
claude auth status
# Should show: Authenticated as [your email]
```

### Test Claude Code Manually

```bash
claude --print "Create a simple React component"
```

If this works, Chef integration should work too.

## Troubleshooting

### "Claude Code CLI not found"

**Solution**: Install globally
```bash
npm install -g @anthropic-ai/claude-code
```

### "Authentication failed"

**Solution**: Login to Claude Code
```bash
claude auth login
```

### "Permission denied" errors

**Solution**: Ensure Claude Code has Pro subscription active
```bash
claude auth status
```

### Messages not streaming

**Check**:
1. `USE_CLAUDE_AGENT_SDK=1` is in `.env.local`
2. You selected **Anthropic** as the provider in Chef UI
3. Console shows SDK logs (🚀 [SDK] ...)

### Still using API calls

If Chef is still calling Anthropic API instead of Claude Code:

1. Restart both `pnpm run dev` and `npx convex dev`
2. Hard reload browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check `.env.local` has `USE_CLAUDE_AGENT_SDK=1`
4. Verify model provider is set to "Anthropic" in Chef settings

## Comparison: API vs Claude Code

| Feature | Anthropic API | Claude Code (This Integration) |
|---------|---------------|-------------------------------|
| **Cost** | Pay per token | Free with Pro subscription |
| **Rate Limits** | API tier limits | Pro subscription limits |
| **Tools** | Basic AI SDK tools | Full Claude Code toolset |
| **File Operations** | Via custom tools | Native Read/Write/Edit |
| **Context Management** | Manual truncation | Automatic by SDK |
| **Local Execution** | No | Yes (via CLI) |
| **Setup** | API key | CLI installation |

## Benefits

### For Development
- **No API costs** during development/testing
- **Better debugging** with CLI logs
- **Familiar tools** if you use Claude Code already

### For Production
- **Cost savings** if you have Pro subscription
- **Better tool usage** - Claude Code is optimized for coding tasks
- **Consistent behavior** with your local Claude Code experience

## Limitations

### Requires Pro Subscription
Claude Code CLI needs an active Claude Pro subscription. Without it, you'll get authentication errors.

### Server Environment
This integration requires:
- Node.js server (not serverless/edge)
- Ability to spawn child processes
- Claude CLI installed globally

### Not for Vercel Edge/Cloudflare Workers
The integration uses `child_process` to spawn Claude CLI, which doesn't work in edge runtimes. For those, use the standard API integration.

## Switching Back to API

To revert to using Anthropic API directly:

1. Remove `USE_CLAUDE_AGENT_SDK=1` from `.env.local`
2. Add your API key: `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart Chef

## Advanced: Custom Chef System Prompts

Chef has specialized prompts in `/chef-agent/prompts/`. When using Claude Code, you can inject these into the SDK:

Edit `claude-agent-sdk.ts:80-82` to customize the system prompt:

```typescript
systemPrompt: {
  type: 'preset' as const,
  preset: 'claude_code' as const,
},
```

Or use custom prompts:

```typescript
systemPrompt: {
  type: 'custom' as const,
  content: 'You are Chef, specialized in building Convex apps...',
},
```

## Summary

This integration lets you use Claude Code as the AI engine powering Chef, replacing API calls with local CLI execution. It's cost-effective, powerful, and gives you the best of both worlds: Chef's Convex-focused UX + Claude Code's superior tooling.

**Quick Start**:
```bash
# 1. Install CLI
npm install -g @anthropic-ai/claude-code

# 2. Login
claude auth login

# 3. Enable in Chef
echo 'USE_CLAUDE_AGENT_SDK=1' >> .env.local

# 4. Start Chef
pnpm run dev
npx convex dev  # in another terminal

# 5. Build apps with Claude Code!
```
