import {
  createDataStream,
  streamText,
  type CoreAssistantMessage,
  type CoreMessage,
  type CoreToolMessage,
  type DataStreamWriter,
  type LanguageModelUsage,
  type Message,
  type ProviderMetadata,
  type StepResult,
} from 'ai';
import { ROLE_SYSTEM_PROMPT, generalSystemPrompt } from 'chef-agent/prompts/system';
import { deployTool } from 'chef-agent/tools/deploy';
import { viewTool } from 'chef-agent/tools/view';
import type { ConvexToolSet } from 'chef-agent/types';
import { npmInstallTool } from 'chef-agent/tools/npmInstall';
import type { Tracer } from '~/lib/.server/chat';
import { editTool } from 'chef-agent/tools/edit';
import { captureException, captureMessage } from '@sentry/remix';
import type { SystemPromptOptions } from 'chef-agent/types';
import { cleanupAssistantMessages } from 'chef-agent/cleanupAssistantMessages';
import { logger } from 'chef-agent/utils/logger';
import { encodeUsageAnnotation, encodeModelAnnotation } from '~/lib/.server/usage';
import { compressWithLz4Server } from '~/lib/compression.server';
import { getConvexSiteUrl } from '~/lib/convexSiteUrl';
import { REPEATED_ERROR_REASON } from '~/lib/common/annotations';
import { waitUntil } from '@vercel/functions';
import type { internal } from '@convex/_generated/api';
import type { Usage } from '~/lib/common/annotations';
import type { UsageRecord } from '@convex/schema';
import { getProvider, type ModelProvider } from '~/lib/.server/llm/provider';
import { getEnv } from '~/lib/.server/env';
import { calculateChefTokens, usageFromGeneration } from '~/lib/common/usage';
import { lookupDocsTool } from 'chef-agent/tools/lookupDocs';
import { addEnvironmentVariablesTool } from 'chef-agent/tools/addEnvironmentVariables';
import { getConvexDeploymentNameTool } from 'chef-agent/tools/getConvexDeploymentName';
import type { PromptCharacterCounts } from 'chef-agent/ChatContextManager';
import { claudeAgentSDK } from '~/lib/.server/llm/claude-agent-sdk';
import { WebContainerSync } from '~/lib/.server/webcontainer-sync';

type Messages = Message[];

export async function convexAgent(args: {
  chatInitialId: string;
  firstUserMessage: boolean;
  messages: Messages;
  tracer: Tracer | null;
  modelProvider: ModelProvider;
  modelChoice: string | undefined;
  userApiKey: string | undefined;
  shouldDisableTools: boolean;
  recordUsageCb: (
    lastMessage: Message | undefined,
    finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  ) => Promise<void>;
  recordRawPromptsForDebugging: boolean;
  collapsedMessages: boolean;
  promptCharacterCounts?: PromptCharacterCounts;
  featureFlags: {
    enableResend: boolean;
  };
}) {
  const {
    chatInitialId,
    firstUserMessage,
    messages,
    tracer,
    modelProvider,
    userApiKey,
    modelChoice,
    shouldDisableTools,
    recordUsageCb,
    recordRawPromptsForDebugging,
    collapsedMessages,
    promptCharacterCounts,
    featureFlags,
  } = args;

  // Check if we should use Claude Agent SDK (requires Claude Code CLI to be installed and authenticated)
  const useClaudeAgentSDK = getEnv('USE_CLAUDE_AGENT_SDK') === '1' && modelProvider === 'Anthropic';
  if (useClaudeAgentSDK) {
    console.debug('Using Claude Agent SDK with Pro subscription');
    return convexAgentWithSDK(args);
  }

  console.debug('Starting agent with model provider', modelProvider);
  if (userApiKey) {
    console.debug('Using user provided API key');
  }

  const startTime = Date.now();
  let firstResponseTime: number | null = null;

  const provider = getProvider(userApiKey, modelProvider, modelChoice);
  const opts: SystemPromptOptions = {
    enableBulkEdits: true,
    includeTemplate: true,
    openaiProxyEnabled: getEnv('OPENAI_PROXY_ENABLED') == '1',
    usingOpenAi: modelProvider == 'OpenAI',
    usingGoogle: modelProvider == 'Google',
    resendProxyEnabled: getEnv('RESEND_PROXY_ENABLED') == '1',
    enableResend: featureFlags.enableResend,
  };
  const tools: ConvexToolSet = {
    deploy: deployTool,
    npmInstall: npmInstallTool,
    lookupDocs: lookupDocsTool(),
    getConvexDeploymentName: getConvexDeploymentNameTool,
  };
  tools.addEnvironmentVariables = addEnvironmentVariablesTool();
  tools.view = viewTool;
  tools.edit = editTool;

  let cleanedMessages = cleanupAssistantMessages(messages);

  // Conservative token estimate: 1 token ≈ 2.5 characters (accounting for complex content)
  // Keep last N messages to stay well under 200k token limit
  const MAX_TOKENS = 150000; // Conservative limit leaving room for system prompts & safety margin
  const CHARS_PER_TOKEN = 2.5;
  const maxChars = MAX_TOKENS * CHARS_PER_TOKEN;

  let totalChars = 0;
  let messageStartIndex = 0;

  // Count backwards from the end to keep most recent messages
  for (let i = cleanedMessages.length - 1; i >= 0; i--) {
    const msg = cleanedMessages[i];
    const msgChars = JSON.stringify(msg.content).length;

    if (totalChars + msgChars > maxChars && i < cleanedMessages.length - 1) {
      // Only truncate if we're not at the last message (always keep at least the last message)
      messageStartIndex = i + 1;
      break;
    }
    totalChars += msgChars;
  }

  // If we truncated, keep only the recent messages
  if (messageStartIndex > 0) {
    logger.warn(
      `Truncating message history: keeping last ${cleanedMessages.length - messageStartIndex} of ${cleanedMessages.length} messages (estimated ${Math.round(totalChars / CHARS_PER_TOKEN)} tokens)`,
    );
    cleanedMessages = cleanedMessages.slice(messageStartIndex);
  }

  const messagesForDataStream: CoreMessage[] = [
    {
      role: 'system' as const,
      content: ROLE_SYSTEM_PROMPT,
    },
    {
      role: 'system' as const,
      content: generalSystemPrompt(opts),
    },
    ...cleanedMessages,
  ];

  if (modelProvider === 'Bedrock') {
    messagesForDataStream[messagesForDataStream.length - 1].providerOptions = {
      bedrock: {
        cachePoint: {
          type: 'default',
        },
      },
    };
  }

  if (modelProvider === 'Anthropic') {
    messagesForDataStream[messagesForDataStream.length - 1].providerOptions = {
      anthropic: {
        cacheControl: {
          type: 'ephemeral',
        },
      },
    };
  }

  const dataStream = createDataStream({
    execute(dataStream) {
      const result = streamText({
        model: provider.model,
        maxTokens: provider.maxTokens,
        providerOptions: provider.options,
        messages: messagesForDataStream,
        tools,
        toolChoice: shouldDisableTools ? 'none' : 'auto',
        onFinish: (result) => {
          onFinishHandler({
            dataStream,
            messages,
            result,
            tracer,
            chatInitialId,
            recordUsageCb,
            toolsDisabledFromRepeatedErrors: shouldDisableTools,
            recordRawPromptsForDebugging,
            coreMessages: messagesForDataStream,
            modelProvider,
            modelChoice,
            collapsedMessages,
            promptCharacterCounts,
            _startTime: startTime,
            _firstResponseTime: firstResponseTime,
            providerModel: provider.model.modelId,
          });
        },
        onError({ error }) {
          console.error(error);
        },
        experimental_telemetry: {
          isEnabled: true,
          metadata: {
            firstUserMessage,
            chatInitialId,
            provider: modelProvider,
          },
        },
      });

      // Track first response time
      (async () => {
        try {
          for await (const _ of result.textStream) {
            if (firstResponseTime === null) {
              firstResponseTime = Date.now();
              const timeToFirstResponse = firstResponseTime - startTime;
              if (tracer) {
                const span = tracer.startSpan('first-response');
                span.setAttribute('chatInitialId', chatInitialId);
                span.setAttribute('timeToFirstResponse', timeToFirstResponse);
                span.setAttribute('provider', modelProvider);
                span.end();
              }
              console.log('First response metrics:', {
                timeToFirstResponse: `${timeToFirstResponse}ms`,
                provider: modelProvider,
                chatInitialId,
              });
              break;
            }
          }
        } catch (error) {
          console.error('Error tracking first response time:', error);
        }
      })();

      result.mergeIntoDataStream(dataStream);
    },
    onError(error: any) {
      return error.message;
    },
  });
  return dataStream;
}

async function onFinishHandler({
  dataStream,
  messages,
  result,
  tracer,
  chatInitialId,
  recordUsageCb,
  toolsDisabledFromRepeatedErrors,
  recordRawPromptsForDebugging,
  coreMessages,
  modelProvider,
  modelChoice,
  collapsedMessages,
  promptCharacterCounts,
  _startTime,
  _firstResponseTime,
  providerModel,
}: {
  dataStream: DataStreamWriter;
  messages: Messages;
  result: Omit<StepResult<any>, 'stepType' | 'isContinued'>;
  tracer: Tracer | null;
  chatInitialId: string;
  recordUsageCb: (
    lastMessage: Message | undefined,
    finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  ) => Promise<void>;
  recordRawPromptsForDebugging: boolean;
  toolsDisabledFromRepeatedErrors: boolean;
  coreMessages: CoreMessage[];
  modelProvider: ModelProvider;
  modelChoice: string | undefined;
  collapsedMessages: boolean;
  promptCharacterCounts?: PromptCharacterCounts;
  _startTime: number;
  _firstResponseTime: number | null;
  providerModel: string;
}) {
  const { providerMetadata } = result;
  // This usage accumulates accross multiple /api/chat calls until finishReason of 'stop'.
  const usage = {
    completionTokens: normalizeUsage(result.usage.completionTokens),
    promptTokens: normalizeUsage(result.usage.promptTokens),
    totalTokens: normalizeUsage(result.usage.totalTokens),
  };
  console.log('Finished streaming', {
    finishReason: result.finishReason,
    usage,
    providerMetadata,
  });
  console.log('Prompt character counts', promptCharacterCounts);
  if (tracer) {
    const span = tracer.startSpan('on-finish-handler');
    span.setAttribute('chatInitialId', chatInitialId);
    span.setAttribute('finishReason', result.finishReason);
    span.setAttribute('usage.completionTokens', usage.completionTokens);
    span.setAttribute('usage.promptTokens', usage.promptTokens);
    span.setAttribute('usage.totalTokens', usage.totalTokens);
    span.setAttribute('collapsedMessages', collapsedMessages);
    span.setAttribute('model', providerModel);

    if (promptCharacterCounts) {
      span.setAttribute('promptCharacterCounts.messageHistoryChars', promptCharacterCounts.messageHistoryChars);
      span.setAttribute('promptCharacterCounts.currentTurnChars', promptCharacterCounts.currentTurnChars);
      span.setAttribute('promptCharacterCounts.totalPromptChars', promptCharacterCounts.totalPromptChars);
    }
    if (providerMetadata) {
      if (providerMetadata.anthropic) {
        const anthropic: any = providerMetadata.anthropic;
        span.setAttribute('providerMetadata.anthropic.cacheCreationInputTokens', anthropic.cacheCreationInputTokens);
        span.setAttribute('providerMetadata.anthropic.cacheReadInputTokens', anthropic.cacheReadInputTokens);
      }
      if (providerMetadata.google) {
        const google: any = providerMetadata.google;
        span.setAttribute('providerMetadata.google.cachedContentTokenCount', google.cachedContentTokenCount ?? 0);
      }
      if (providerMetadata.openai) {
        const openai: any = providerMetadata.openai;
        span.setAttribute('providerMetadata.openai.cachedPromptTokens', openai.cachedPromptTokens ?? 0);
      }
      if (providerMetadata.bedrock) {
        const bedrock: any = providerMetadata.bedrock;
        span.setAttribute(
          'providerMetadata.bedrock.cacheCreationInputTokens',
          bedrock.usage?.cacheCreationInputTokens ?? 0,
        );
        span.setAttribute('providerMetadata.bedrock.cacheReadInputTokens', bedrock.usage?.cacheReadInputTokens ?? 0);
      }
    }
    if (result.finishReason === 'stop' || result.finishReason === 'unknown') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // This field is deprecated, but for some reason, the new field "parts", does not contain all of the tool calls. This is likely a
        // vercel bug. We do this at the end end the request because it's when we have the results from all of the tool calls.
        const toolCalls = lastMessage.toolInvocations?.filter((t) => t.toolName === 'deploy' && t.state === 'result');
        const successfulDeploys =
          toolCalls?.filter((t) => t.state === 'result' && !t.result.startsWith('Error:')).length ?? 0;
        span.setAttribute('tools.successfulDeploys', successfulDeploys);
        span.setAttribute('tools.failedDeploys', toolCalls ? toolCalls.length - successfulDeploys : 0);
      }
      span.setAttribute('tools.disabledFromRepeatedErrors', toolsDisabledFromRepeatedErrors ? 'true' : 'false');
    }
    span.end();
  }

  if (toolsDisabledFromRepeatedErrors) {
    dataStream.writeMessageAnnotation({ type: 'failure', reason: REPEATED_ERROR_REASON });
  }

  let toolCallId: { kind: 'tool-call'; toolCallId: string } | { kind: 'final' } | undefined;
  // Always stash this part's usage as an annotation -- these are used for
  // displaying usage info in the UI as well as calculating usage when the message
  // finishes.
  if (result.finishReason === 'tool-calls') {
    if (result.toolCalls.length === 1) {
      toolCallId = { kind: 'tool-call', toolCallId: result.toolCalls[0].toolCallId };
    } else {
      logger.warn('Stopped with not exactly one tool call', {
        toolCalls: result.toolCalls,
      });
    }
  } else if (result.finishReason === 'stop') {
    toolCallId = { kind: 'final' };
  }
  if (toolCallId) {
    const annotation = encodeUsageAnnotation(toolCallId, usage, providerMetadata);
    dataStream.writeMessageAnnotation({ type: 'usage', usage: annotation });
    const modelAnnotation = encodeModelAnnotation(toolCallId, providerMetadata, modelChoice);
    dataStream.writeMessageAnnotation({ type: 'model', ...modelAnnotation });
  }

  // Record usage once we've generated the final part.
  if (result.finishReason === 'stop') {
    await recordUsageCb(messages[messages.length - 1], { usage, providerMetadata });
  }
  if (recordRawPromptsForDebugging) {
    const responseCoreMessages = result.response.messages as (CoreAssistantMessage | CoreToolMessage)[];
    // don't block the request but keep the request alive in Vercel Lambdas
    waitUntil(
      storeDebugPrompt(
        coreMessages,
        chatInitialId,
        responseCoreMessages,
        result,
        {
          usage,
          providerMetadata,
        },
        modelProvider,
      ),
    );
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/* Convert Usage into something stable to store in Convex debug logs */
function buildUsageRecord(usage: Usage): UsageRecord {
  const usageRecord = {
    completionTokens: 0,
    promptTokens: 0,
    cachedPromptTokens: 0,
  };

  for (const k of Object.keys(usage) as Array<keyof Usage>) {
    switch (k) {
      case 'completionTokens': {
        usageRecord.completionTokens += usage.completionTokens;
        break;
      }
      case 'promptTokens': {
        usageRecord.promptTokens += usage.promptTokens;
        break;
      }
      case 'xaiCachedPromptTokens': {
        usageRecord.cachedPromptTokens += usage.xaiCachedPromptTokens;
        usageRecord.promptTokens += usage.xaiCachedPromptTokens;
        break;
      }
      case 'openaiCachedPromptTokens': {
        usageRecord.cachedPromptTokens += usage.openaiCachedPromptTokens;
        break;
      }
      case 'anthropicCacheReadInputTokens': {
        usageRecord.cachedPromptTokens += usage.anthropicCacheReadInputTokens;
        usageRecord.promptTokens += usage.anthropicCacheReadInputTokens;
        break;
      }
      case 'anthropicCacheCreationInputTokens': {
        usageRecord.promptTokens += usage.anthropicCacheCreationInputTokens;
        break;
      }
      case 'googleCachedContentTokenCount': {
        usageRecord.cachedPromptTokens += usage.googleCachedContentTokenCount;
        break;
      }
      case 'googleThoughtsTokenCount': {
        usageRecord.completionTokens += usage.googleThoughtsTokenCount;
        break;
      }
      case 'bedrockCacheWriteInputTokens': {
        usageRecord.promptTokens += usage.bedrockCacheWriteInputTokens;
        break;
      }
      case 'bedrockCacheReadInputTokens': {
        usageRecord.cachedPromptTokens += usage.bedrockCacheReadInputTokens;
        usageRecord.promptTokens += usage.bedrockCacheReadInputTokens;
        break;
      }
      case 'toolCallId':
      case 'providerMetadata':
      case 'totalTokens': {
        break;
      }
      default: {
        const exhaustiveCheck: never = k;
        throw new Error(`Unhandled property: ${String(exhaustiveCheck)}`);
      }
    }
  }

  return usageRecord;
}

async function storeDebugPrompt(
  promptCoreMessages: CoreMessage[],
  chatInitialId: string,
  responseCoreMessages: CoreMessage[],
  result: Omit<StepResult<any>, 'stepType' | 'isContinued'>,
  generation: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  modelProvider: ModelProvider,
) {
  try {
    const finishReason = result.finishReason;
    const modelId = result.response.modelId || '';
    const usage = usageFromGeneration(generation);

    const promptMessageData = new TextEncoder().encode(JSON.stringify(promptCoreMessages));
    const compressedData = compressWithLz4Server(promptMessageData);

    type Metadata = Omit<(typeof internal.debugPrompt.storeDebugPrompt)['_args'], 'promptCoreMessagesStorageId'>;
    const { chefTokens } = calculateChefTokens(usage, modelProvider);

    const metadata = {
      chatInitialId,
      responseCoreMessages,
      finishReason,
      modelId,
      usage: buildUsageRecord(usage),
      chefTokens,
    } satisfies Metadata;

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('promptCoreMessages', new Blob([compressedData]));

    const response = await fetch(`${getConvexSiteUrl()}/upload_debug_prompt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      const message = `Failed to store debug prompt: ${response.status} ${text}`;
      console.error(message);
      captureMessage(message);
    }
  } catch (error) {
    console.error(error);
    captureException(error);
  }
}

function normalizeUsage(usage: number) {
  return Number.isNaN(usage) ? 0 : usage;
}

// Extract files from previous messages (from artifacts)
function extractFilesFromMessages(messages: Messages): Record<string, string> {
  const files: Record<string, string> = {};

  // Look through all assistant messages for artifacts
  for (const message of messages) {
    if (message.role === 'assistant' && typeof message.content === 'string') {
      // Parse boltArtifact tags
      const artifactRegex = /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/g;
      let artifactMatch;

      while ((artifactMatch = artifactRegex.exec(message.content)) !== null) {
        const artifactContent = artifactMatch[1];

        // Extract file actions
        const fileRegex = /<boltAction\s+type="file"\s+filePath="([^"]+)">([\s\S]*?)<\/boltAction>/g;
        let fileMatch;

        while ((fileMatch = fileRegex.exec(artifactContent)) !== null) {
          const filePath = fileMatch[1];
          let content = fileMatch[2].trim();

          // Remove markdown code blocks if present
          content = content.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');

          files[filePath] = content;
        }
      }
    }
  }

  return files;
}

// Helper functions to format tool calls and results for display
function formatToolCall(toolName: string, input: any): string {
  switch (toolName) {
    case 'Read':
      return `\n**📖 Read** \`${input.file_path}\`\n\n`;
    case 'Write':
      return `\n**✏️ Write** \`${input.file_path}\`\n\n`;
    case 'Edit':
      return `\n**✏️ Edit** \`${input.file_path}\`\n\n`;
    case 'Bash':
      return `\n**⚙️ Running command:** \`${input.command}\`\n\n`;
    default:
      return `\n**🔧 ${toolName}**\n\n`;
  }
}

function formatToolResult(content: string): string | null {
  // Don't show very long tool results, just a preview
  if (!content || content.length > 500) {
    return null;
  }
  // Show short, informative results
  if (content.includes('successfully') || content.includes('completed')) {
    return `✅ ${content.substring(0, 200)}\n\n`;
  }
  return null;
}

// Claude Agent SDK integration
async function convexAgentWithSDK(args: {
  chatInitialId: string;
  firstUserMessage: boolean;
  messages: Messages;
  tracer: Tracer | null;
  modelProvider: ModelProvider;
  modelChoice: string | undefined;
  userApiKey: string | undefined;
  shouldDisableTools: boolean;
  recordUsageCb: (
    lastMessage: Message | undefined,
    finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
  ) => Promise<void>;
  recordRawPromptsForDebugging: boolean;
  collapsedMessages: boolean;
  promptCharacterCounts?: PromptCharacterCounts;
  featureFlags: {
    enableResend: boolean;
  };
}) {
  const { messages, modelChoice, userApiKey, chatInitialId } = args;

  console.log('🎯 [INTEGRATION] Starting SDK integration');
  console.log('🎯 [INTEGRATION] Chat ID:', chatInitialId);
  console.log('🎯 [INTEGRATION] Messages count:', messages.length);
  console.log('🎯 [INTEGRATION] Model choice:', modelChoice);

  const dataStream = createDataStream({
    async execute(dataStream) {
      console.log('🎯 [INTEGRATION] Execute function called');
      try {
        console.log('🎯 [INTEGRATION] Calling claudeAgentSDK...');

        // Create WebContainer sync instance
        const wcSync = new WebContainerSync(chatInitialId);
        wcSync.ensurePackageJson();

        // Extract existing files from previous messages
        const existingFiles = extractFilesFromMessages(messages);
        console.log(`📂 [INTEGRATION] Extracted ${Object.keys(existingFiles).length} existing files from chat history`);

        const sdkMessages = claudeAgentSDK({
          messages,
          modelChoice,
          userApiKey,
          cwd: process.cwd(),
          chatInitialId,  // Pass chat ID for project-specific directory
          files: existingFiles,  // Pass existing files so Claude can see and modify them
        });

        console.log('🎯 [INTEGRATION] SDK generator created, starting iteration...');

        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let sessionId = '';
        let messageCount = 0;

        for await (const message of sdkMessages) {
          messageCount++;
          console.log(`🎯 [INTEGRATION] Received message #${messageCount}:`, message.type);

          // Stream SDK messages to the data stream
          switch (message.type) {
            case 'stream_event':
              // This is the real-time streaming event from Claude Code!
              // It includes thinking blocks, tool executions, and text as it's generated
              console.log('📡 [INTEGRATION] Stream event:', message.event.type);

              const event = message.event;

              // Handle different streaming event types
              if (event.type === 'content_block_start') {
                if (event.content_block?.type === 'thinking') {
                  // Thinking block started!
                  console.log('🧠 [INTEGRATION] Thinking block started');
                  dataStream.writeData('\n\n**🧠 Thinking...**\n\n');
                } else if (event.content_block?.type === 'tool_use') {
                  console.log('🔧 [INTEGRATION] Tool use started:', event.content_block.name);
                  const toolDisplay = formatToolCall(event.content_block.name, event.content_block.input || {});
                  dataStream.writeData(toolDisplay);
                }
              } else if (event.type === 'content_block_delta') {
                // Stream content as it's being generated
                if (event.delta?.type === 'thinking_delta') {
                  // Stream thinking text in real-time
                  const thinking = event.delta.thinking || '';
                  console.log('🧠 [INTEGRATION] Thinking delta:', thinking.substring(0, 50));
                  dataStream.writeData(thinking);
                } else if (event.delta?.type === 'text_delta') {
                  // Stream response text in real-time
                  const text = event.delta.text || '';
                  console.log('💬 [INTEGRATION] Text delta:', text.substring(0, 50));
                  dataStream.writeData(text);
                }
              } else if (event.type === 'content_block_stop') {
                // Content block finished
                console.log('✅ [INTEGRATION] Content block stopped');
                dataStream.writeData('\n\n');
              }
              break;

            case 'assistant':
              console.log('💬 [INTEGRATION] Processing complete assistant message');
              // This is the complete message after streaming
              // We can use it to extract tool uses for file sync
              const content = message.message.content;
              if (Array.isArray(content)) {
                for (const block of content) {
                  if (block.type === 'tool_use') {
                    console.log('🔧 [INTEGRATION] Tool use complete:', block.name);
                    // Track tool use for file sync later
                    if (['Write', 'Edit', 'Bash'].includes(block.name)) {
                      // We'll sync files after all tool results come in
                    }
                  }
                }
              }
              break;

            case 'user':
              console.log('👤 [INTEGRATION] Processing user message (tool result)');
              // User messages from SDK contain tool results
              const userContent = message.message.content;
              if (Array.isArray(userContent)) {
                for (const block of userContent) {
                  if (block.type === 'tool_result') {
                    console.log('✅ [INTEGRATION] Tool result received');
                    // Tool result is already shown via stream events
                    // Files will be synced at the end of the stream
                  }
                }
              }
              break;

            case 'system':
              console.log('⚙️ [INTEGRATION] Processing system message:', message.subtype);
              if (message.subtype === 'init') {
                sessionId = message.session_id;
                console.log('✅ [INTEGRATION] SDK initialized!', {
                  sessionId,
                  model: message.model,
                  toolCount: message.tools.length,
                });
                logger.info('Claude Agent SDK initialized', {
                  model: message.model,
                  tools: message.tools.length,
                });
                // Show initialization message
                dataStream.writeData(`\n**🚀 Claude Code Engine Started**\n\n`);
                dataStream.writeData(`Model: ${message.model}\n`);
                dataStream.writeData(`Tools: ${message.tools.length} available\n\n`);
              }
              break;

            case 'result':
              console.log('✅ [INTEGRATION] Processing result:', message.subtype);
              if (message.subtype === 'success') {
                const usage = message.usage;
                totalInputTokens = (usage?.input_tokens || 0) +
                                  (usage?.cache_read_input_tokens || 0) +
                                  (usage?.cache_creation_input_tokens || 0);
                totalOutputTokens = usage?.output_tokens || 0;

                console.log('📊 [INTEGRATION] Usage:', {
                  input: totalInputTokens,
                  output: totalOutputTokens,
                  cost: message.total_cost_usd,
                });

                // Final result - show completion message
                dataStream.writeData('\n\n---\n\n');
                dataStream.writeData(`**✅ Task Complete**\n\n`);
                dataStream.writeData(`- Turns: ${message.num_turns}\n`);
                dataStream.writeData(`- Input tokens: ${totalInputTokens.toLocaleString()}\n`);
                dataStream.writeData(`- Output tokens: ${totalOutputTokens.toLocaleString()}\n`);
                dataStream.writeData(`- Cost: $${message.total_cost_usd.toFixed(4)}\n\n`);

                logger.info('Claude Agent SDK completed', {
                  turns: message.num_turns,
                  cost: message.total_cost_usd,
                  duration: message.duration_ms,
                });
              } else {
                console.error('❌ [INTEGRATION] Error result:', message.subtype);
                dataStream.writeData(`\n\n**❌ Error:** ${message.subtype}\n\n`);
              }
              break;

            default:
              console.log('⚠️ [INTEGRATION] Unknown message type:', (message as any).type);
          }
        }

        console.log(`✅ [INTEGRATION] Stream completed! Total messages: ${messageCount}`);

        // Read all files generated by Claude CLI
        console.log('📁 [INTEGRATION] Reading generated files from temp directory...');
        const generatedFiles = wcSync.readFiles();
        console.log(`✅ [INTEGRATION] Found ${Object.keys(generatedFiles).length} files`);

        // Send file artifacts to sync to WebContainer
        if (Object.keys(generatedFiles).length > 0) {
          console.log('📤 [INTEGRATION] Sending files to WebContainer...');

          // Create a bolt artifact to write all files
          const artifactId = `claude-cli-${chatInitialId}-${Date.now()}`;

          // Send artifact open
          dataStream.writeData(`\n\n<boltArtifact id="${artifactId}" title="Generated Files">\n`);

          // Send each file as a boltAction
          for (const [filePath, content] of Object.entries(generatedFiles)) {
            console.log(`  📄 [INTEGRATION] Adding file: ${filePath}`);
            dataStream.writeData(`<boltAction type="file" filePath="${filePath}">\n${content}\n</boltAction>\n`);
          }

          // Close artifact
          dataStream.writeData(`</boltArtifact>\n\n`);

          console.log('✅ [INTEGRATION] Files sent to WebContainer');
        }
      } catch (error: any) {
        console.error('❌ [INTEGRATION] Error in execute:', error.message);
        console.error('❌ [INTEGRATION] Error stack:', error.stack);
        logger.error('Claude Agent SDK error:', error);
        dataStream.writeData({
          type: 'error',
          error: error.message || 'Unknown error',
        });
      }
    },
    onError(error: any) {
      console.error('❌ [INTEGRATION] onError called:', error.message);
      return error.message;
    },
  });

  console.log('🎯 [INTEGRATION] Returning data stream');
  return dataStream;
}
