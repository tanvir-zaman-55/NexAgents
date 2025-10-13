import type { Message } from 'ai';
import { logger } from 'chef-agent/utils/logger';
import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';

export async function* claudeAgentSDK(args: {
  messages: Message[];
  modelChoice: string | undefined;
  userApiKey: string | undefined;
  cwd: string;
  chatInitialId: string;
  files?: Record<string, string>;
}) {
  const { messages, modelChoice, cwd, chatInitialId, files } = args;

  console.log('🚀 [SDK] Starting Claude Agent SDK integration');
  console.log('🚀 [SDK] Chat ID:', chatInitialId);
  console.log('🚀 [SDK] Total messages:', messages.length);
  console.log('🚀 [SDK] Model choice:', modelChoice);
  console.log('🚀 [SDK] Base CWD:', cwd);
  console.log('🚀 [SDK] Files provided:', files ? Object.keys(files).length : 0);

  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  console.log('🚀 [SDK] Last message role:', lastMessage?.role);

  if (!lastMessage || lastMessage.role !== 'user') {
    console.error('❌ [SDK] Last message must be from user');
    throw new Error('Last message must be from user');
  }

  // Extract prompt from message
  let prompt = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);

  // Add context about Chef/Convex conventions if there are existing files
  if (files && Object.keys(files).length > 0) {
    const fileList = Object.keys(files).join(', ');
    prompt = `You are working on an existing Convex + React app with these files: ${fileList}

The user asked: ${prompt}

Guidelines:
- This is a Convex app with React frontend (Vite)
- Backend code goes in convex/ directory
- Frontend code goes in src/ directory
- Use Convex queries/mutations for database operations
- Files are already in the project directory, you can Read and Edit them
- Maintain existing code structure and conventions`;
  }

  console.log('🚀 [SDK] Prompt length:', prompt.length);
  console.log('🚀 [SDK] Prompt preview:', prompt.substring(0, 100) + '...');

  // Create project-specific working directory
  const { tmpdir } = await import('os');
  const { join } = await import('path');
  const { mkdirSync, writeFileSync, existsSync, cpSync, readdirSync } = await import('fs');

  const projectDir = join(tmpdir(), 'chef-projects', chatInitialId);
  mkdirSync(projectDir, { recursive: true });
  console.log('🚀 [SDK] Project directory:', projectDir);

  // Copy template files if project is empty (first run)
  const templatePath = join(cwd, 'template');
  try {
    const existingFiles = readdirSync(projectDir);
    if (existingFiles.length === 0 && existsSync(templatePath)) {
      console.log('📋 [SDK] Copying template files to project directory...');
      cpSync(templatePath, projectDir, { recursive: true });
      console.log('✅ [SDK] Template files copied');
    }
  } catch (error) {
    console.warn('⚠️ [SDK] Could not copy template:', error);
  }

  // Always copy .env.local for Convex deployment info
  const envLocalPath = join(cwd, 'template', '.env.local');
  const targetEnvPath = join(projectDir, '.env.local');
  try {
    if (existsSync(envLocalPath) && !existsSync(targetEnvPath)) {
      cpSync(envLocalPath, targetEnvPath);
      console.log('✅ [SDK] Copied .env.local for Convex deployment');
    }
  } catch (error) {
    console.warn('⚠️ [SDK] Could not copy .env.local:', error);
  }

  // If files were provided, write them to the project directory
  if (files && Object.keys(files).length > 0) {
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = join(projectDir, filePath);
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));

      mkdirSync(dir, { recursive: true });
      writeFileSync(fullPath, content, 'utf-8');
    }
    console.log(`✅ [SDK] Wrote ${Object.keys(files).length} files to project directory`);
  }

  // Ensure package.json exists
  const packageJsonPath = join(projectDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    writeFileSync(
      packageJsonPath,
      JSON.stringify(
        {
          name: 'chef-project',
          version: '0.0.0',
          type: 'module',
          dependencies: {
            convex: '^1.17.0',
            react: '^18.3.1',
          },
        },
        null,
        2
      )
    );
  }

  try {
    console.log('🚀 [SDK] Starting Claude Agent SDK query...');

    // Use the SDK's query() function for proper streaming
    const sdkQuery = query({
      prompt,
      options: {
        cwd: projectDir,
        model: modelChoice,
        permissionMode: 'bypassPermissions',  // Skip permission prompts
        maxTurns: 50,
        includePartialMessages: true,  // Include streaming events and thinking blocks
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `

You are helping build a Convex application. Context:
- Backend code goes in convex/ directory
- Frontend code goes in src/ directory
- Use Convex queries/mutations for database operations
- This is a React + Vite app
- Show your thinking process and explain what you're doing`,
        },
      },
    });

    console.log('✅ [SDK] Query started, streaming messages...');

    let messageCount = 0;

    // Stream all SDK messages
    for await (const message of sdkQuery) {
      messageCount++;
      console.log(`📨 [SDK] Message #${messageCount}:`, message.type);

      // Yield the raw SDK message - the caller will handle formatting
      yield message as SDKMessage;
    }

    console.log(`✅ [SDK] Completed! Total messages: ${messageCount}`);
  } catch (error: any) {
    console.error('❌ [SDK] Error occurred:', error.message);
    console.error('❌ [SDK] Error stack:', error.stack);
    logger.error('Claude Agent SDK error:', error);
    throw error;
  }
}
