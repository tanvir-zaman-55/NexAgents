# Claude Code Integration Guide

## Current Status

The Claude Agent SDK has been installed but **requires the Claude Code CLI** to be installed on the system. This isn't practical for a web application.

## Two Approaches to Use Claude Code Capabilities

### Option 1: Direct Anthropic SDK with Custom Tools (Current Implementation ✅)

**Status:** Already working in your app!

Your app already implements the same tools that Claude Code uses:
- File operations (Read, Write, Edit)
- Code execution (Bash)
- Search (Grep, Glob)
- Custom Convex tools (Deploy, npm install, etc.)

**Location:** `app/lib/.server/llm/convex-agent.ts`

This is the recommended approach for web applications.

### Option 2: Claude Agent SDK (Requires CLI Installation ❌)

**Status:** Installed but disabled

The `@anthropic-ai/claude-agent-sdk` package requires:
1. Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code`)
2. Local file system access
3. Direct process execution

**Not suitable for:**
- Web applications
- Serverless environments
- Docker containers without CLI

**Good for:**
- Local development tools
- CI/CD pipelines
- Command-line applications

## Recommendation

**Stick with your current implementation** (Option 1). You already have:

1. ✅ All the tools Claude Code provides
2. ✅ Better context management (token truncation)
3. ✅ Custom Convex-specific tools
4. ✅ Works in serverless/web environments
5. ✅ No external dependencies

## What You Fixed Today

1. **Empty message validation** - Prevents sending whitespace-only messages
2. **Token limit handling** - Automatically truncates old messages to stay under 200k tokens
3. **Message filtering** - Ensures all messages have valid content

These fixes make your implementation **more robust than using the SDK** because you have fine-grained control over the behavior.

## If You Still Want Claude Agent SDK

You would need to:

1. Install Claude Code CLI on your server:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. Modify your deployment to include the CLI

3. Set `USE_CLAUDE_AGENT_SDK=1` in your environment

4. Accept that it won't work in most cloud/serverless environments

**Bottom line:** Your current setup is better for a web application.
