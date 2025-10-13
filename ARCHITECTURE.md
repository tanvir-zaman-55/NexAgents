# Chef + Claude Code Integration Architecture

## Overview

Chef can use **Claude Code** as its AI engine instead of making API calls. This document explains how it works.

## Standard Chef (API Mode)

```
┌────────────────────┐
│   Chef Web UI      │ User types: "Build a todo app"
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│   Remix Backend    │ Receives prompt via /api/chat
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│   streamText()     │ Calls Anthropic/OpenAI/Google API
│   (Vercel AI SDK)  │ Uses Chef's custom tools (edit, view, deploy)
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│   Anthropic API    │ $$$ API cost per token
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│   WebContainer     │ Files modified in browser
│   (Browser)        │ Code runs in virtualized Node.js
└────────────────────┘
```

**Problem**: API costs can add up quickly for heavy users.

## Chef with Claude Code (SDK Mode)

```
┌────────────────────┐
│   Chef Web UI      │ User types: "Build a todo app"
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│   Remix Backend    │ Receives prompt via /api/chat
└──────┬─────────────┘
       │
       │ if USE_CLAUDE_AGENT_SDK=1
       ▼
┌─────────────────────────────────────┐
│   Claude Agent SDK                  │
│   (@anthropic-ai/claude-agent-sdk)  │
└──────┬──────────────────────────────┘
       │
       │ Spawns subprocess
       ▼
┌─────────────────────────────────────┐
│   Claude Code CLI                   │ Runs: claude --print "<prompt>"
│   (Local process)                   │ Working dir: /tmp/chef-projects/<chatId>
│                                     │
│   Available tools:                  │
│   • Read, Write, Edit, MultiEdit    │
│   • Bash (run commands)             │
│   • Grep, Glob (search)             │
│   • WebFetch, WebSearch             │
└──────┬──────────────────────────────┘
       │
       │ Creates files in temp directory
       ▼
┌─────────────────────────────────────┐
│   /tmp/chef-projects/<chatId>/      │
│   ├── src/                          │
│   │   └── App.tsx                   │
│   ├── convex/                       │
│   │   └── schema.ts                 │
│   └── package.json                  │
└──────┬──────────────────────────────┘
       │
       │ Streams results back
       ▼
┌─────────────────────────────────────┐
│   Chef Backend                      │ Receives tool calls & file changes
└──────┬──────────────────────────────┘
       │
       │ Streams to browser
       ▼
┌─────────────────────────────────────┐
│   Chef Web UI                       │ Shows generated code
│   → WebContainer                    │ Files synced to WebContainer
└─────────────────────────────────────┘
```

**Benefits**:
- ✅ **Free** (uses Claude Pro subscription)
- ✅ **Better tools** (Claude Code's native file operations)
- ✅ **Isolated projects** (each chat has own directory)

## Key Differences

### File System Handling

**API Mode**:
- Files only exist in WebContainer (browser memory)
- AI model uses Chef's custom tools (`editTool`, `viewTool`)
- Tools directly modify WebContainer filesystem

**SDK Mode**:
- Files exist in temp directory: `/tmp/chef-projects/<chatId>/`
- Claude Code uses its native tools (Read, Write, Edit, Bash)
- Changes stream back and sync to WebContainer

### Project Isolation

Each chat creates an isolated project directory:

```bash
/tmp/chef-projects/
├── chat-abc123/          # Chat 1
│   ├── src/
│   ├── convex/
│   └── package.json
│
├── chat-def456/          # Chat 2
│   ├── src/
│   ├── convex/
│   └── package.json
│
└── chat-ghi789/          # Chat 3
    ├── src/
    ├── convex/
    └── package.json
```

**Why?**
- Multiple chats can run simultaneously
- No file conflicts between projects
- Claude Code sees realistic project structure
- Each project can have different dependencies

### Message Flow

**API Mode**:
```
User → Chef → streamText() → Anthropic API → Response → WebContainer
```

**SDK Mode**:
```
User → Chef → Claude Agent SDK → Claude CLI → Temp Dir → Response → WebContainer
```

## Integration Details

### Entry Point

`app/lib/.server/llm/convex-agent.ts:79-84`

```typescript
const useClaudeAgentSDK = getEnv('USE_CLAUDE_AGENT_SDK') === '1' && modelProvider === 'Anthropic';
if (useClaudeAgentSDK) {
  console.debug('Using Claude Agent SDK with Pro subscription');
  return convexAgentWithSDK(args);  // Takes different code path
}
```

### SDK Wrapper

`app/lib/.server/llm/claude-agent-sdk.ts`

Key responsibilities:
1. **Find Claude CLI**: Auto-detects installation via `which claude`
2. **Create project directory**: `/tmp/chef-projects/<chatInitialId>`
3. **Configure SDK**: Sets up allowed tools, system prompt, permissions
4. **Stream results**: Yields messages back to Chef

### Project Directory Setup

```typescript
// Create isolated directory for this chat
const projectDir = join(tmpdir(), 'chef-projects', chatInitialId);
mkdirSync(projectDir, { recursive: true });

// Ensure package.json exists (Claude Code expects valid Node project)
writeFileSync(packageJsonPath, JSON.stringify({
  name: 'chef-project',
  version: '0.0.0',
  type: 'module',
  dependencies: {
    convex: '^1.17.0',
    react: '^18.3.1',
  }
}, null, 2));

// Run Claude Code in this directory
const sdkOptions = {
  cwd: projectDir,  // ← Project-specific!
  model: 'claude-sonnet-4-5',
  allowedTools: ['Read', 'Write', 'Edit', ...],
  // ...
};
```

### Claude Code Execution

The SDK spawns:
```bash
claude --print \
  --output-format stream-json \
  --dangerously-skip-permissions \
  "<user prompt>"
```

Inside the project directory, Claude Code can:
- `Read` existing files
- `Write` new files
- `Edit` files
- `Bash` run npm install, tests, etc.
- `Grep`/`Glob` search for code
- `WebFetch` documentation

All file operations happen in `/tmp/chef-projects/<chatId>/`.

### Result Streaming

Claude Code streams back messages:
- `system` - SDK initialization
- `assistant` - Text responses & tool calls
- `user` - Tool results
- `stream_event` - Real-time progress
- `result` - Final completion with usage stats

Chef's integration forwards these to the browser via `dataStream`.

## Tool Compatibility

### Claude Code's Tools vs Chef's Tools

**Claude Code tools** (used in SDK mode):
- `Read` - Read any file
- `Write` - Create new files
- `Edit` - Modify existing files
- `MultiEdit` - Batch edits
- `Bash` - Execute commands
- `Grep`/`Glob` - Search
- `WebFetch`/`WebSearch` - Fetch docs

**Chef's tools** (used in API mode):
- `edit` - Modify files in WebContainer
- `view` - Read files from WebContainer
- `deploy` - Deploy to Convex
- `npmInstall` - Install dependencies
- `lookupDocs` - Search Convex docs
- `addEnvironmentVariables` - Set env vars
- `getConvexDeploymentName` - Get deployment info

**Implication**: When using Claude Code, you get general-purpose tools instead of Chef-specific tools. Claude Code doesn't know about `deploy` or Convex-specific operations.

**Workaround**: Claude Code can still accomplish the same tasks:
- Instead of `deploy` tool → It generates instructions or uses `Bash` to run `npx convex deploy`
- Instead of `lookupDocs` → It uses `WebFetch` to read Convex docs
- Instead of `addEnvironmentVariables` → It edits `.env` files directly

## Configuration

### Enable Integration

```bash
# .env.local
USE_CLAUDE_AGENT_SDK=1
```

### Disable Integration

```bash
# Remove or comment out
# USE_CLAUDE_AGENT_SDK=1
```

Or use the toggle script:
```bash
./scripts/toggle-claude-code.sh disable
```

### Requirements

1. Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`
2. Authenticated: `claude auth login`
3. Active Claude Pro subscription
4. Provider must be set to "Anthropic" in Chef UI

## Debugging

### Check Integration Status

```bash
./scripts/verify-claude-code-setup.sh
```

### View Project Directories

```bash
ls -la /tmp/chef-projects/
```

Each directory corresponds to a chat ID. You can inspect the generated files:

```bash
cd /tmp/chef-projects/<chatId>
tree
```

### Monitor Logs

Look for these prefixes in console:
- `🚀 [SDK]` - SDK setup and initialization
- `📨 [SDK]` - Message streaming
- `🎯 [INTEGRATION]` - Integration layer
- `✅ [SDK]` - Success/completion

### Clean Up Old Projects

```bash
# Remove all temp projects
rm -rf /tmp/chef-projects/

# Or remove specific chat
rm -rf /tmp/chef-projects/chat-abc123
```

## Performance Considerations

### Pros
- **No API latency** - Local CLI execution
- **Faster for Pro users** - No rate limits
- **Better context** - Full project structure visible

### Cons
- **Subprocess overhead** - Spawning CLI adds ~500ms
- **Filesystem I/O** - Writing files to disk vs in-memory WebContainer
- **Temp directory bloat** - Old projects accumulate (cleanup needed)

### Recommendations

For **heavy users with Pro subscription**: Enable SDK mode
For **occasional users**: Use API mode
For **teams**: Consider dedicated API key with high limits

## Security

### Permissions

Claude Code runs with `--dangerously-skip-permissions`, which means:
- ✅ No interactive prompts (good for server automation)
- ⚠️  Claude Code can access any file in project directory
- ✅ Limited to `/tmp/chef-projects/<chatId>/` (isolated)
- ⚠️  Could theoretically read system files if asked

**Mitigation**: Files are isolated per chat, and Claude Code only has access to the specific project directory.

### Temp Directory Security

- Files are in `/tmp/` which is usually cleared on reboot
- No sensitive data should be in these directories
- Consider adding cleanup cron job for production deployments

## Future Enhancements

### Possible Improvements

1. **Automatic cleanup**: Delete project directories after chat ends
2. **File syncing**: Two-way sync between WebContainer ↔ temp directory
3. **Custom tools**: Give Claude Code access to Chef's tools (deploy, etc.)
4. **Caching**: Reuse project directory across sessions
5. **Docker isolation**: Run Claude Code in containers for better security

### Known Limitations

1. **No deploy tool**: Claude Code doesn't have Chef's `deploy` tool
2. **Manual syncing**: Files don't auto-sync from temp dir to WebContainer
3. **Temp directory growth**: Old projects accumulate indefinitely
4. **No parallel execution**: One Claude Code instance per chat

## Summary

The Claude Code integration transforms Chef from using API calls to using a local CLI process. Each chat gets an isolated project directory where Claude Code can work with real files, then results stream back to the Web UI and sync to WebContainer.

**Trade-offs**:
- 💰 **Free** (uses Pro subscription) vs $$$ API costs
- 🚀 **Better tools** (native file ops) vs specialized Chef tools
- 📁 **Real filesystem** (temp directory) vs WebContainer (browser memory)
- ⚡ **Subprocess overhead** (~500ms) vs direct API calls

For Pro subscribers building frequently, this integration can save significant costs while providing a better development experience.
