import Anthropic from '@anthropic-ai/sdk';
import { AIClientError } from './errors';

export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
export const DEFAULT_MAX_TOKENS = 4096;

let anthropicClient: Anthropic | null = null;

/** Return the singleton Anthropic SDK client for server-side usage. */
export function getAnthropicClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new AIClientError('ANTHROPIC_API_KEY is not configured for the Claude client');
    }

    anthropicClient = new Anthropic({ apiKey });
  }

  return anthropicClient;
}
