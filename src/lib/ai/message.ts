import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL, getAnthropicClient } from './client';
import { AIResponseParseError, toAIError } from './errors';
import { extractJSON } from './json-parser';
import { withRetry } from './retry';

type SupportedImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export interface SendMessageOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

export interface SendVisionMessageOptions extends SendMessageOptions {
  images: Array<{
    data: string;
    mediaType: SupportedImageMediaType;
  }>;
}

function getTextFromResponse(response: { content?: Array<{ type?: string; text?: string }> }) {
  return response.content
    ?.filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('') ?? '';
}

function normalizeMessageOptions(options: SendMessageOptions) {
  return {
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: options.systemPrompt,
  };
}

function validateBase64Images(images: SendVisionMessageOptions['images']) {
  for (const image of images) {
    if (!image.data.trim()) {
      throw new AIResponseParseError('Vision image payload is empty', image.data);
    }
  }
}

/** Send a text-only Claude message and return the text response. */
export async function sendMessage(options: SendMessageOptions): Promise<string> {
  return withRetry(async () => {
    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        ...normalizeMessageOptions(options),
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: options.prompt }],
          },
        ],
      });

      return getTextFromResponse(response);
    } catch (error) {
      throw toAIError(error);
    }
  });
}

/** Send a Claude vision message and return the text response. */
export async function sendVisionMessage(options: SendVisionMessageOptions): Promise<string> {
  validateBase64Images(options.images);

  return withRetry(async () => {
    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        ...normalizeMessageOptions(options),
        messages: [
          {
            role: 'user',
            content: [
              ...options.images.map((image) => ({
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: image.mediaType,
                  data: image.data,
                },
              })),
              { type: 'text' as const, text: options.prompt },
            ],
          },
        ],
      });

      return getTextFromResponse(response);
    } catch (error) {
      throw toAIError(error);
    }
  });
}

/** Send a text message and parse the JSON object returned by Claude. */
export async function sendMessageForJSON<T>(options: SendMessageOptions): Promise<T> {
  return withRetry(() => sendMessage(options).then((text) => extractJSON<T>(text)), {
    retryOn: (error) => error instanceof AIResponseParseError,
  });
}

/** Send a vision message and parse the JSON object returned by Claude. */
export async function sendVisionMessageForJSON<T>(
  options: SendVisionMessageOptions
): Promise<T> {
  return withRetry(() => sendVisionMessage(options).then((text) => extractJSON<T>(text)), {
    retryOn: (error) => error instanceof AIResponseParseError,
  });
}

/** Stream text deltas from a text-only Claude message. */
export async function* streamMessage(options: SendMessageOptions): AsyncGenerator<string> {
  const client = getAnthropicClient();
  const stream = client.messages.stream({
    ...normalizeMessageOptions(options),
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: options.prompt }],
      },
    ],
  });

  for await (const event of stream as AsyncIterable<{
    type?: string;
    delta?: { type?: string; text?: string };
  }>) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      yield event.delta.text ?? '';
    }
  }
}

/** Stream text deltas from a vision-enabled Claude message. */
export async function* streamVisionMessage(
  options: SendVisionMessageOptions
): AsyncGenerator<string> {
  validateBase64Images(options.images);

  const client = getAnthropicClient();
  const stream = client.messages.stream({
    ...normalizeMessageOptions(options),
    messages: [
      {
        role: 'user',
        content: [
          ...options.images.map((image) => ({
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: image.mediaType,
              data: image.data,
            },
          })),
          { type: 'text' as const, text: options.prompt },
        ],
      },
    ],
  });

  for await (const event of stream as AsyncIterable<{
    type?: string;
    delta?: { type?: string; text?: string };
  }>) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      yield event.delta.text ?? '';
    }
  }
}
