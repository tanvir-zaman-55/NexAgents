import { convertToCoreMessages } from 'ai';
import type { Message } from 'ai';
import { EXCLUDED_FILE_PATHS } from './constants.js';

export function cleanupAssistantMessages(messages: Message[]) {
  let processedMessages = messages.map((message) => {
    if (message.role == 'assistant') {
      let content = cleanMessage(message.content);
      let parts = message.parts?.map((part) => {
        if (part.type === 'text') {
          part.text = cleanMessage(part.text);
        }
        return part;
      });
      return { ...message, content, parts };
    } else {
      return message;
    }
  });
  // Filter out empty messages and messages with empty parts
  processedMessages = processedMessages.filter(
    (message) =>
      message.content.trim() !== '' ||
      (message.parts &&
        message.parts.filter((part) => part.type === 'text' || part.type === 'tool-invocation').length > 0),
  );
  return convertToCoreMessages(processedMessages).filter((message) => {
    if (message.content.length === 0) return false;

    // For messages with content arrays, ensure at least one text block has non-whitespace content
    if (Array.isArray(message.content)) {
      return message.content.some((part) => {
        if (part.type === 'text') {
          return part.text.trim().length > 0;
        }
        // Keep messages with tool-use or other non-text parts
        return part.type !== 'text';
      });
    }

    return true;
  });
}

function cleanMessage(message: string) {
  message = message.replace(/<div class=\\"__boltThought__\\">.*?<\/div>/s, '');
  message = message.replace(/<think>.*?<\/think>/s, '');
  // We prevent the LLM from modifying a list of files
  for (const excludedPath of EXCLUDED_FILE_PATHS) {
    const escapedPath = excludedPath.replace(/\//g, '\\/');
    message = message.replace(
      new RegExp(`<boltAction type="file" filePath="${escapedPath}"[^>]*>[\\s\\S]*?<\\/boltAction>`, 'g'),
      `You tried to modify \`${excludedPath}\` but this is not allowed. Please modify a different file.`,
    );
  }
  return message;
}
