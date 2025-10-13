# AI Agent Process: Code Generation & Deployment

This document explains the step-by-step process and prompts that the AI agent (Chef) uses to create, edit, and deploy code.

---

## Overview

Chef is an AI assistant designed to help users develop and deploy full-stack web applications using Convex for the backend. The agent follows a structured process involving planning, code generation, editing, and deployment.

---

## Core Architecture

### 1. Request Flow

```
User Request → API Chat Handler → Token Check → Provider Selection → Agent Execution → Response Stream
```

**File**: `app/lib/.server/chat.ts`

#### Key Steps:
1. **Request Reception** (`chatAction` function)
   - Receives user messages and configuration
   - Validates authentication token
   - Checks model provider (Anthropic, OpenAI, Google, XAI, Bedrock)

2. **Token/API Key Management**
   - Checks if user has Convex tokens available
   - Determines whether to use user's API key or system API key
   - Falls back to user API key if quota is exhausted

3. **Model Provider Selection**
   - Selects appropriate model based on provider
   - Default models:
     - Anthropic: `claude-3-5-sonnet-20241022`
     - Google: `gemini-2.5-pro`
     - OpenAI: `gpt-4.1`
     - XAI: `grok-3-mini`

---

## Agent Execution Process

### 2. Agent Initialization

**File**: `app/lib/.server/llm/convex-agent.ts`

#### System Prompts

**Role Prompt** (First prompt sent to the model):
```
You are Chef, an expert AI assistant and exceptional senior software developer with vast
knowledge across computer science, programming languages, frameworks, and best practices.
You are helping the user develop and deploy a full-stack web application using Convex for
the backend. Convex is a reactive database with real-time updates. You are extremely persistent
and will not stop until the user's application is successfully deployed. You are concise.
```

**General System Prompt** (Guidelines and instructions):
- Solution constraints (Convex-specific patterns)
- Formatting instructions (code style, structure)
- Example data instructions (how to generate sample data)
- Secrets handling instructions (API keys, environment variables)
- Output formatting instructions
- Provider-specific guidelines (OpenAI, Google)

---

### 3. Tools Available to the Agent

The agent has access to the following tools for code manipulation:

#### Tool 1: **View Tool**
**File**: `chef-agent/tools/view.ts`

**Purpose**: Read file contents or list directories

**Parameters**:
- `path`: Absolute path to the file
- `view_range`: Optional array [start_line, end_line] for partial reads

**Description**:
```
Read the contents of a file or list a directory. Be sure to use this tool when you're editing
a file and aren't sure what its contents are. The file contents are returned as a string with
1-indexed line numbers.
```

---

#### Tool 2: **Edit Tool**
**File**: `chef-agent/tools/edit.ts`

**Purpose**: Replace text in a file

**Parameters**:
- `path`: Absolute path to the file
- `old`: Text fragment to replace (max 1024 chars)
- `new`: New text fragment (max 1024 chars)

**Description**:
```
Replace a string of text that appears exactly once in a file with a new string of text.
Use this tool when fixing a bug or making a small tweak to a file. You MUST know a file's
current contents before using this tool. This may either be from context or previous use
of the `view` tool.
```

**Constraints**:
- Must know file contents before editing
- Old and new strings must be < 1024 characters
- Text must appear exactly once in the file

---

#### Tool 3: **Deploy Tool**
**File**: `chef-agent/tools/deploy.ts`

**Purpose**: Deploy app to Convex and start dev server

**Description**:
```
Deploy the app to Convex and start the Vite development server (if not already running).
Execute this tool call after you've used an artifact to write files to the filesystem
and the app is complete. Do NOT execute this tool if the app isn't in a working state.
After initially writing the app, you MUST execute this tool after making any changes
to the filesystem.
```

**Special Notes**:
- If esbuild errors occur, Node.js dependencies should be isolated in files with `"use node"`
- Files with `"use node"` can only contain actions, NOT queries or mutations

---

#### Tool 4: **NPM Install Tool**
**File**: `chef-agent/tools/npmInstall.ts`

**Purpose**: Install npm packages

---

#### Tool 5: **Lookup Docs Tool**
**File**: `chef-agent/tools/lookupDocs.ts`

**Purpose**: Search Convex documentation

---

#### Tool 6: **Add Environment Variables Tool**
**File**: `chef-agent/tools/addEnvironmentVariables.ts`

**Purpose**: Add environment variables to the project

---

#### Tool 7: **Get Convex Deployment Name Tool**
**File**: `chef-agent/tools/getConvexDeploymentName.ts`

**Purpose**: Retrieve the current Convex deployment name

---

## Step-by-Step Agent Workflow

### Step 1: Understanding User Request
1. Agent receives user message(s)
2. Context is built from message history
3. System prompts are prepended to provide role and guidelines

### Step 2: Planning Phase
1. Agent analyzes the request
2. Determines what files need to be created/modified
3. Identifies dependencies and required packages

### Step 3: File Reading (if needed)
**Prompt Pattern**:
```
To understand the current state, I need to view the file at <path>
Tool: view
Parameters: {path: "/path/to/file"}
```

### Step 4: Code Generation/Editing
**Prompt Pattern for Editing**:
```
I need to update <file> to <reason>
Tool: edit
Parameters: {
  path: "/path/to/file",
  old: "existing code fragment",
  new: "new code fragment"
}
```

**Prompt Pattern for New Files** (via artifacts):
- Agent writes complete file content
- Uses structured format with file paths

### Step 5: Dependency Installation
**Prompt Pattern**:
```
The app requires package <name> for <reason>
Tool: npmInstall
Parameters: {packages: ["package-name"]}
```

### Step 6: Deployment
**Prompt Pattern**:
```
The changes are complete, deploying the application
Tool: deploy
Parameters: {}
```

---

## Response Streaming

### Streaming Process
1. **Text Stream**: Agent's reasoning and explanations
2. **Tool Calls**: Structured function calls to tools
3. **Tool Results**: Outputs from tool executions
4. **Usage Annotations**: Token usage tracking
5. **Model Annotations**: Model-specific metadata

**File**: `app/lib/.server/llm/convex-agent.ts` (lines 137-212)

### Finish Conditions
- **`stop`**: Agent completed the task successfully
- **`tool-calls`**: Agent needs to execute tools (continues conversation)
- **`unknown`**: Unexpected termination

---

## Token & Usage Tracking

### Token Calculation
1. **Prompt tokens**: Input messages + system prompts + context
2. **Completion tokens**: Agent's generated response
3. **Cached tokens**: Reused prompt segments (provider-specific)

### Provider-Specific Caching
- **Anthropic**: Ephemeral cache control on last message
- **Bedrock**: Default cache points
- **Google**: Cached content token count
- **OpenAI**: Cached prompt tokens

**File**: `app/lib/.server/llm/convex-agent.ts` (lines 117-135, 253-318)

---

## Error Handling

### Repeated Error Protection
- If agent encounters repeated errors with tools
- Tools are disabled (`shouldDisableTools: true`)
- Agent responds in text-only mode
- Error annotation added to message

### API Key Errors
- Invalid API key returns 401 error
- Missing API key prompts user to provide one
- Falls back between user/system API keys

---

## Example Complete Flow

### User Request: "Create a simple todo app"

1. **Agent receives request** → System prompts loaded
2. **Planning**: "I'll create a todo app with Convex backend"
3. **View existing files**: Check project structure
4. **Create schema**: Define todo data model
5. **Create queries/mutations**: CRUD operations
6. **Create UI components**: React frontend
7. **Install dependencies**: React, Convex client
8. **Deploy**: Push to Convex, start dev server
9. **Response**: "Todo app deployed successfully at [URL]"

---

## Key Prompting Patterns

### Pattern 1: Sequential Tool Use
```
1. View file to understand current state
2. Edit file with specific changes
3. Deploy to apply changes
```

### Pattern 2: Iterative Development
```
1. Create initial structure
2. Deploy and test
3. If errors occur, fix and redeploy
4. Repeat until successful
```

### Pattern 3: Dependency Management
```
1. Identify required packages
2. Install via npmInstall tool
3. Import and use in code
4. Deploy with new dependencies
```

---

## Configuration & Environment

### Environment Variables Checked
- `ANTHROPIC_API_KEY` / `ANTHROPIC_LOW_QOS_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY` / `GOOGLE_VERTEX_CREDENTIALS_JSON`
- `XAI_API_KEY`
- `AWS_ROLE_ARN` / `AWS_REGION` (for Bedrock)
- `AXIOM_API_TOKEN` (telemetry)
- `DISABLE_BEDROCK` (feature flag)
- `OPENAI_PROXY_ENABLED`
- `RESEND_PROXY_ENABLED`

### Model Parameters
- **Max tokens**: 8192 - 24576 (model-dependent)
- **Temperature**: Controlled by model provider defaults
- **Tool choice**: `auto` (or `none` if disabled)

---

## Telemetry & Monitoring

### Metrics Tracked
1. **Time to first response** (TTFR)
2. **Total response time**
3. **Token usage** (prompt, completion, cached)
4. **Tool execution** (success/failure counts)
5. **Provider metadata** (cache hits, model ID)

### Tracing (Axiom)
- Span created for each major operation
- Attributes include chatId, provider, timing
- Tool calls and results logged
- Usage statistics attached

**File**: `app/lib/.server/llm/convex-agent.ts` (lines 186-193, 266-318)

---

## Summary

The AI agent follows a structured, tool-based approach to code generation:

1. **Understand** → Read context and requirements
2. **Plan** → Determine files and changes needed
3. **Read** → View existing code with `view` tool
4. **Modify** → Edit code with `edit` tool or create new files
5. **Install** → Add dependencies with `npmInstall` tool
6. **Deploy** → Push changes with `deploy` tool
7. **Iterate** → Fix errors and redeploy as needed

All interactions are streamed in real-time, with token usage tracked and errors handled gracefully.
