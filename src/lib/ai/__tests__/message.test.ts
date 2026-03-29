import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();
const streamMock = vi.fn();

vi.mock('@/lib/ai/client', () => ({
  DEFAULT_MAX_TOKENS: 4096,
  DEFAULT_MODEL: 'claude-sonnet-4-5-20250929',
  getAnthropicClient: () => ({
    messages: {
      create: createMock,
      stream: streamMock,
    },
  }),
}));

describe('ai message helpers', () => {
  beforeEach(() => {
    createMock.mockReset();
    streamMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends text-only messages and includes optional system prompts', async () => {
    createMock.mockResolvedValue({
      content: [{ type: 'text', text: 'hello there' }],
    });

    const { sendMessage } = await import('@/lib/ai/message');
    const result = await sendMessage({ prompt: 'Hello', systemPrompt: 'System context' });

    expect(result).toBe('hello there');
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'System context',
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }],
      })
    );
  });

  it('sends vision messages with image blocks and parses JSON responses', async () => {
    createMock
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'vision ok' }] })
      .mockResolvedValueOnce({ content: [{ type: 'text', text: '```json\n{"ok":true}\n```' }] });

    const { sendMessageForJSON, sendVisionMessage, streamMessage } = await import('@/lib/ai/message');

    await expect(
      sendVisionMessage({
        prompt: 'Analyze',
        images: [
          { data: 'aGVsbG8=', mediaType: 'image/png' },
          { data: 'd29ybGQ=', mediaType: 'image/jpeg' },
        ],
      })
    ).resolves.toBe('vision ok');

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: [
              expect.objectContaining({ type: 'image' }),
              expect.objectContaining({ type: 'image' }),
              { type: 'text', text: 'Analyze' },
            ],
          },
        ],
      })
    );

    await expect(sendMessageForJSON<{ ok: boolean }>({ prompt: 'Return JSON' })).resolves.toEqual({
      ok: true,
    });

    streamMock.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hel' } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'lo' } };
      },
    });

    const chunks: string[] = [];
    for await (const chunk of streamMessage({ prompt: 'Stream' })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['hel', 'lo']);
  });
});
