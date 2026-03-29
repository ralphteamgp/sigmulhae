import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIClientError } from '@/lib/ai/errors';

const anthropicMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: anthropicMock,
}));

describe('ai client', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('throws AIClientError when the api key is missing', async () => {
    await expect(import('@/lib/ai/client').then(({ getAnthropicClient }) => getAnthropicClient())).rejects.toBeInstanceOf(
      AIClientError
    );
  });

  it('creates a singleton anthropic client when the api key exists', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const { DEFAULT_MAX_TOKENS, DEFAULT_MODEL, getAnthropicClient } = await import(
      '@/lib/ai/client'
    );
    const firstClient = getAnthropicClient();
    const secondClient = getAnthropicClient();

    expect(DEFAULT_MODEL).toBe('claude-sonnet-4-5-20250929');
    expect(DEFAULT_MAX_TOKENS).toBe(4096);
    expect(anthropicMock).toHaveBeenCalledTimes(1);
    expect(anthropicMock).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(secondClient).toBe(firstClient);
  });
});
