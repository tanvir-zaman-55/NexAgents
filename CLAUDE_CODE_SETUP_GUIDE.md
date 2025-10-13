# Claude Code as Main Engine - Setup Guide

## ✅ What's Fixed

I've updated your integration to use **Claude Code as the main engine** with the **same interface** you'd get from API models, including:

- ✅ **Real-time thinking blocks** - See Claude's reasoning as it works
- ✅ **Live code updates** - Watch files being created and edited in real-time
- ✅ **Tool execution streaming** - See bash commands, file reads/writes as they happen
- ✅ **Development server tools** - Claude can run `npm dev`, `pnpm dev`, etc.
- ✅ **Same UX as Claude Code CLI** - Full agentic capabilities in your web UI

## 🎯 How It Works

### Old (Broken) Approach
- Spawned Claude CLI process with `--output-format stream-json`
- Only got structured JSON output
- **No thinking blocks**
- **No real-time streaming**
- Limited visibility into what Claude was doing

### New (Fixed) Approach
- Uses `@anthropic-ai/claude-agent-sdk` npm package's `query()` function
- Gets **full streaming events** including:
  - `thinking_delta` - Claude's reasoning in real-time
  - `text_delta` - Response text as it's generated
  - `tool_use` - Tool calls with inputs
  - `tool_result` - Results from tools
- Same experience as running `claude` in your terminal!

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Claude Code CLI globally (if not already installed)
npm install -g @anthropic-ai/claude-code

# Login with your Claude Pro account
claude auth login

# Verify authentication
claude auth status
```

### 2. Enable Claude Code Engine

Your `.env.local` already has this enabled:
```bash
USE_CLAUDE_AGENT_SDK=1
```

### 3. Start the Development Server

```bash
# Terminal 1: Start Convex backend
npx convex dev

# Terminal 2: Start Chef frontend
pnpm run dev
```

### 4. Use Chef with Claude Code

1. Open http://127.0.0.1:5173
2. In settings, select **Anthropic** as your provider
3. Start chatting!

When you ask Claude to build something, you'll now see:

```
🚀 Claude Code Engine Started

Model: claude-sonnet-4-5
Tools: 15 available

🧠 Thinking...
I need to create a React component for a todo list. Let me start by...
[thinking streams in real-time]

📖 Read src/App.tsx

✏️ Write src/components/TodoList.tsx

⚙️ Running command: npm install

✅ Task Complete

- Turns: 12
- Input tokens: 45,234
- Output tokens: 8,932
- Cost: $0.2341
```

## 🛠️ What Changed

### File: `app/lib/.server/llm/claude-agent-sdk.ts`

**Before:** Spawned CLI process, parsed JSON lines
**After:** Uses SDK's `query()` function for proper streaming

```typescript
// Now using the official SDK
import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';

const sdkQuery = query({
  prompt,
  options: {
    cwd: projectDir,
    model: modelChoice,
    permissionMode: 'bypassPermissions',
    maxTurns: 50,
    includePartialMessages: true,  // ← THIS IS KEY!
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
    },
  },
});

// Stream all messages including thinking blocks
for await (const message of sdkQuery) {
  yield message;
}
```

### File: `app/lib/.server/llm/convex-agent.ts`

**Before:** Only handled complete messages
**After:** Handles streaming events in real-time

```typescript
case 'stream_event':
  const event = message.event;

  if (event.type === 'content_block_delta') {
    if (event.delta?.type === 'thinking_delta') {
      // Stream thinking text as it's generated
      dataStream.writeData(event.delta.thinking);
    } else if (event.delta?.type === 'text_delta') {
      // Stream response text as it's generated
      dataStream.writeData(event.delta.text);
    }
  }
  break;
```

## 🎨 Features You Now Have

### 1. Real-Time Thinking Blocks

Claude's reasoning process streams live:
```
🧠 Thinking...
I need to analyze the current codebase structure...
Based on the files, I should create a new component...
Let me write the TypeScript interface first...
```

### 2. Live Tool Execution

See tools as they run:
```
📖 Read package.json
✏️ Write src/NewComponent.tsx
⚙️ Running command: npm install react-router-dom
✅ Command completed successfully
```

### 3. Development Server Support

Claude can:
- Run `npm run dev` / `pnpm dev`
- Install dependencies with `npm install`
- Run tests with `npm test`
- Execute any bash command

### 4. Multi-Turn Agentic Behavior

Claude can:
- Plan a multi-step task
- Execute tools sequentially
- Handle errors and retry
- Show progress through each step

## 📊 Token Usage & Costs

The integration now shows detailed usage:
- Input tokens (including cached)
- Output tokens
- Number of agentic turns
- Total cost in USD

Example:
```
✅ Task Complete

- Turns: 8
- Input tokens: 23,451
- Output tokens: 5,234
- Cost: $0.1245
```

## 🧪 Testing

### Test 1: Simple App Generation
```
Prompt: "Create a simple todo app with React"
```

You should see:
1. Thinking block explaining the approach
2. Files being created in real-time
3. npm install running
4. Dev server starting

### Test 2: Error Handling
```
Prompt: "Add authentication to the app"
```

You should see:
1. Claude thinking about the approach
2. Installing auth libraries
3. Creating auth components
4. Handling any errors that occur

### Test 3: Multi-File Changes
```
Prompt: "Refactor the app to use TypeScript"
```

You should see:
1. Planning the refactor
2. Renaming files .js → .tsx
3. Adding type annotations
4. Installing @types packages

## 🔧 Configuration Options

### Model Selection
The SDK respects your model choice from Chef UI settings.

### Max Turns
Default: 50 turns (configurable in `claude-agent-sdk.ts:130`)

### Working Directory
Each chat gets its own isolated directory:
```
/tmp/chef-projects/<chatId>/
```

Files are synced between:
- Local filesystem (where Claude Code works)
- WebContainer (in the browser)

### Permission Mode
Set to `bypassPermissions` for non-interactive use.

For interactive approval, change to:
```typescript
permissionMode: 'default',  // Will prompt for dangerous operations
```

## 🐛 Troubleshooting

### Issue: "Claude Code CLI not found"
**Solution:**
```bash
npm install -g @anthropic-ai/claude-code
```

### Issue: "Authentication failed"
**Solution:**
```bash
claude auth login
```

### Issue: No thinking blocks showing
**Check:**
1. `includePartialMessages: true` is set in SDK options
2. `stream_event` case is handling `thinking_delta`
3. Browser console shows `🧠 [INTEGRATION] Thinking delta`

### Issue: Files not syncing to WebContainer
**Check:**
1. WebContainerSync is reading files at the end
2. Bolt artifacts are being generated
3. Browser console shows "📤 [INTEGRATION] Sending files to WebContainer"

## 📚 Additional Resources

- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Chef Architecture](./ARCHITECTURE.md)
- [Original Integration Guide](./CLAUDE_CODE_AS_ENGINE.md)

## ✨ What's Next

You now have Claude Code as your main engine! Try:

1. **Build a full-stack app**: Claude can create frontend + Convex backend
2. **Run dev servers**: Claude can start and test your app
3. **Debug issues**: Claude can read logs, run commands, fix errors
4. **Refactor code**: Claude can analyze and improve existing code

The integration gives you the **full power of Claude Code** through your **Chef web interface**!

---

**Need Help?** Check the console logs - they're very detailed and show exactly what's happening at each step.
