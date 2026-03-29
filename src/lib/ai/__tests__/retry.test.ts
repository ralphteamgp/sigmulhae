import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AIClientError,
  AIOverloadError,
  AIRateLimitError,
  AIRequestError,
} from '@/lib/ai/errors';
import { withRetry } from '@/lib/ai/retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns immediately when the first attempt succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    await expect(withRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries once after a recoverable request error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new AIRequestError('temporary failure'))
      .mockResolvedValueOnce('ok');

    const promise = withRetry(fn);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the original error after exhausting retries', async () => {
    vi.useRealTimers();

    const error = new AIRequestError('still failing');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { retryDelayMs: 1 })).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(2);

    vi.useFakeTimers();
  });

  it('does not retry AIClientError instances', async () => {
    const error = new AIClientError('missing key');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('waits on rate-limit and overload errors before retrying', async () => {
    const rateLimited = vi
      .fn()
      .mockRejectedValueOnce(new AIRateLimitError('rate limited', 429, undefined, 2))
      .mockResolvedValueOnce('rate-ok');
    const overloaded = vi
      .fn()
      .mockRejectedValueOnce(new AIOverloadError('overloaded'))
      .mockResolvedValueOnce('overload-ok');

    const ratePromise = withRetry(rateLimited);
    await vi.advanceTimersByTimeAsync(2000);
    await expect(ratePromise).resolves.toBe('rate-ok');

    const overloadPromise = withRetry(overloaded);
    await vi.advanceTimersByTimeAsync(3000);
    await expect(overloadPromise).resolves.toBe('overload-ok');
  });
});
