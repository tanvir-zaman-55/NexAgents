# Quick Start: Chef with Claude Code

**Replace API calls with Claude Code in 3 commands** ⚡

## What This Does

Chef will use **Claude Code** (your CLI) instead of making API calls to Anthropic/OpenAI/Google. You get:
- ✅ No API costs (uses your Pro subscription)
- ✅ Better file operations & tooling
- ✅ Same Chef web UI experience

## Setup (2 minutes)

### 1. Verify Setup
```bash
./scripts/verify-claude-code-setup.sh
```

If all checks pass ✅, continue. Otherwise, follow the error messages.

### 2. Enable Integration
```bash
./scripts/toggle-claude-code.sh enable
```

### 3. Start Chef
```bash
# Terminal 1
pnpm run dev

# Terminal 2 (new terminal)
npx convex dev
```

### 4. Build Apps!

1. Open http://127.0.0.1:5173
2. Start a new chat
3. Make sure **Anthropic** is selected in settings
4. Type your prompt: "Build a todo app with auth"
5. Watch Claude Code generate the code! 🎉

## Behind the Scenes

When you type a prompt:
```
Chef Web UI
    ↓
Chef Backend (Remix + Convex)
    ↓
Claude Agent SDK
    ↓
Claude Code CLI (You!)
    ↓
Code appears in Chef UI ✨
```

## Verify It's Working

Look for these logs in your terminal:
```
🚀 [SDK] Starting Claude Agent SDK
🚀 [SDK] Found Claude CLI at: /home/laith/.nvm/.../claude
📨 [SDK] Message #1: system
💬 [SDK] Assistant message content preview: ...
✅ [SDK] Completed!
```

## Switching Back to API

```bash
./scripts/toggle-claude-code.sh disable
```

Chef will use direct API calls again (requires API keys in `.env.local`).

## Check Status Anytime

```bash
./scripts/toggle-claude-code.sh status
```

Shows:
- ✅ Is integration enabled?
- ✅ Is Claude CLI installed?
- ✅ Are you authenticated?
- ✅ Are API keys configured?

## Troubleshooting

**"Claude Code CLI not found"**
```bash
npm install -g @anthropic-ai/claude-code
```

**"Not authenticated"**
```bash
claude auth login
```

**Still using API calls?**
1. Check `.env.local` has `USE_CLAUDE_AGENT_SDK=1`
2. Restart both terminals (pnpm dev + convex dev)
3. Hard reload browser (Cmd+Shift+R)
4. Verify "Anthropic" is selected in Chef settings

## Full Documentation

See [CLAUDE_CODE_AS_ENGINE.md](./CLAUDE_CODE_AS_ENGINE.md) for complete details, architecture, and advanced configuration.

---

**That's it!** You're now building with Chef powered by Claude Code. 🚀
