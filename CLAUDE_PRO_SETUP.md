# Using Claude Pro Subscription with Your Web App

## ✅ What's Been Done

Your app is now configured to use **Claude Code CLI** with your **Claude Pro subscription** instead of paying per-token via API.

### Installed Components

1. ✅ **Claude Code CLI** - Installed globally at `/home/laith/.nvm/versions/node/v20.19.0/bin/claude`
2. ✅ **Claude Agent SDK** - Integrated into your app
3. ✅ **Environment configured** - API key removed, SDK mode enabled

## 🔐 Authentication Required (One-Time Setup)

To use your Claude Pro subscription, you need to authenticate Claude Code CLI with your claude.ai account.

### Step 1: Log in to Claude Code

Run this command in your terminal:

```bash
claude login
```

This will:
1. Open your browser to claude.ai
2. Ask you to sign in with your Claude Pro account
3. Authorize the CLI to use your subscription
4. Save authentication credentials locally

### Step 2: Verify Authentication

After logging in, verify it worked:

```bash
claude --help
```

If you see the help menu without errors, you're authenticated!

### Step 3: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 How It Works Now

### Before (API Mode)
```
Your App → Anthropic API → Pay per token 💸
```

### After (Pro Subscription Mode)
```
Your App → Claude Code CLI → Your Pro Subscription ✅
```

Your usage counts against your **Claude Pro limits** (~10-40 prompts per 5 hours) instead of API costs.

## 💰 Cost Comparison

### API Mode (Old)
- **Cost:** ~$3 per million input tokens, ~$15 per million output tokens
- **Billing:** Pay as you go
- **Example:** 100 messages/day ≈ $50-150/month

### Pro Subscription Mode (New)
- **Cost:** $20/month flat
- **Billing:** Fixed monthly
- **Limits:** ~10-40 prompts per 5 hours shared with web usage

## ⚙️ Configuration Files Changed

### `.env.development`
```bash
# API key commented out
# ANTHROPIC_API_KEY=sk-ant-...

# SDK enabled
USE_CLAUDE_AGENT_SDK=1
```

### `app/lib/.server/llm/claude-agent-sdk.ts`
- Now points to Claude CLI: `/home/laith/.nvm/versions/node/v20.19.0/bin/claude`
- Uses Pro subscription authentication

### `app/lib/.server/llm/convex-agent.ts`
- Detects `USE_CLAUDE_AGENT_SDK=1` flag
- Routes to SDK when Anthropic provider is selected

## 🔄 Switching Back to API Mode

If you need to switch back to API mode (e.g., for production):

1. **Set API key in environment:**
   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

2. **Disable SDK mode:**
   ```bash
   USE_CLAUDE_AGENT_SDK=0
   ```

3. **Restart your app**

## 🐛 Troubleshooting

### "Connection error" or "CLI not found"

**Solution:** Run `claude login` to authenticate

### "Rate limit exceeded"

**Solution:** You've hit your Pro subscription limits. Wait 5 hours or:
- Use the web interface less (limits are shared)
- Upgrade to Claude Max ($200/month for 20x higher limits)
- Temporarily switch to API mode

### "Session expired"

**Solution:** Re-authenticate with `claude login`

## 📊 Monitoring Usage

Check your Claude Pro usage at: https://claude.ai/settings/limits

Your app usage will appear alongside web usage in the same quota.

## ⚠️ Important Notes

1. **Shared Limits:** CLI and web usage share the same Pro subscription limits
2. **Authentication:** You'll need to re-authenticate if session expires (typically weeks/months)
3. **Development Only:** This setup works great for development; for production, consider:
   - Keeping API mode (more reliable for servers)
   - Using Claude Max if you need higher limits
   - Implementing usage tracking to stay within limits

## 🚀 Next Steps

1. **Run `claude login`** to authenticate
2. **Restart your dev server**
3. **Test the integration** - send a message and verify it works
4. **Monitor your usage** at claude.ai/settings/limits

---

## Need Help?

- Claude Code docs: https://docs.claude.com/en/docs/claude-code
- CLI authentication: https://support.claude.com/en/articles/11145838
- Your current setup: Option 3 (Server Installation) from the integration plan
