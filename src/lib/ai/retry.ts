import {
  AIClientError,
  AIOverloadError,
  AIRateLimitError,
  AIRequestError,
} from './errors';

export interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  retryOn?: (error: Error) => boolean;
}

const DEFAULT_RETRY_DELAY_MS = 1000;

function shouldRetryByDefault(error: Error) {
  return !(error instanceof AIClientError);
}

function getRetryDelay(error: Error, fallbackDelayMs: number) {
  if (error instanceof AIRateLimitError && error.retryAfter) {
    return error.retryAfter * 1000;
  }

  if (error instanceof AIOverloadError) {
    return 3000;
  }

  return fallbackDelayMs;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry recoverable AI operations once by default. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 1,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryOn = shouldRetryByDefault,
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error('Unknown retry failure');

      if (attempt >= maxRetries || !retryOn(normalized)) {
        throw error;
      }

      attempt += 1;
      await sleep(getRetryDelay(normalized, retryDelayMs));
    }
  }
}
