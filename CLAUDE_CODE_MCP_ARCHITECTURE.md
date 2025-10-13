# Chef x Claude Code Integration Architecture

## Overview

This document outlines the architecture for integrating Chef with Claude Code using the Model Context Protocol (MCP).

## Architecture

```
┌─────────────────┐
│   Claude Code   │  (User Interface)
│   CLI/Terminal  │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼─────────────────────────────────────┐
│         Chef MCP Server                      │
│  ┌──────────────────────────────────────┐   │
│  │  Tools:                              │   │
│  │  - chef_create_project               │   │
│  │  - chef_deploy                       │   │
│  │  - chef_run_agent                    │   │
│  │  - chef_query_db                     │   │
│  │  - chef_list_projects                │   │
│  └──────────────┬───────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼──────┐         ┌─────▼────────┐
│   Convex   │         │  Chef Agent  │
│  Backend   │         │     Loop     │
│            │         │              │
│ - Projects │         │ - LLM Calls  │
│ - Messages │         │ - Tools      │
│ - Sessions │         │ - Execution  │
└────────────┘         └──────────────┘
```

## Components

### 1. MCP Server (`mcp-server/`)
- Exposes Chef functionality as MCP tools
- Handles authentication with Convex
- Manages project lifecycle
- Routes requests to appropriate services

### 2. Slash Commands (`.claude/commands/`)
- `/chef-new` - Create a new Chef project
- `/chef-deploy` - Deploy current project to Convex
- `/chef-agent` - Run the Chef agent loop
- `/chef-status` - Check project status
- `/chef-logs` - View project logs

### 3. Integration Points
- **Convex Backend**: All Chef projects stored in Convex DB
- **Agent Loop**: Reuse existing chef-agent logic
- **File System**: Use Claude Code's file operations
- **Authentication**: Leverage existing WorkOS/Convex auth

## Implementation Plan

### Phase 1: MCP Server Setup
1. Create `mcp-server/` directory
2. Initialize MCP server with @modelcontextprotocol/sdk
3. Define Chef tools schema
4. Connect to Convex backend

### Phase 2: Core Tools
1. Implement `chef_create_project` tool
2. Implement `chef_deploy` tool
3. Implement `chef_run_agent` tool
4. Implement `chef_query_db` tool

### Phase 3: Slash Commands
1. Create slash command files in `.claude/commands/`
2. Wire commands to MCP server tools
3. Add helpful prompts and documentation

### Phase 4: Agent Integration
1. Refactor chef-agent to work with MCP
2. Stream agent output to Claude Code
3. Handle file operations through Claude Code

### Phase 5: Testing & Polish
1. End-to-end testing of all workflows
2. Error handling and edge cases
3. Documentation and examples

## Benefits

✅ **Unified Interface**: All Chef functionality accessible through Claude Code
✅ **Preserves Backend**: Keeps powerful Convex backend intact
✅ **Better DX**: Work entirely in terminal, no context switching
✅ **Reusable**: Chef agent logic can be used by any MCP client
✅ **Extensible**: Easy to add new tools and capabilities

## User Workflow Example

```bash
# User in Claude Code terminal
user: /chef-new "Build a todo app with auth"

# Claude Code calls MCP server -> creates Convex project
# Agent loop runs, generates code
# Files appear in workspace

user: /chef-deploy

# Code deployed to Convex
# Returns deployment URL
```
