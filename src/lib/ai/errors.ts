/** Base error for Claude client setup and runtime failures. */
export class AIClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIClientError';
  }
}

/** Error thrown when a request to Anthropic fails. */
export class AIRequestError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = 'AIRequestError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/** Error thrown when Anthropic responds with a rate-limit status. */
export class AIRateLimitError extends AIRequestError {
  retryAfter?: number;

  constructor(
    message = 'Claude API rate limited the request',
    statusCode = 429,
    originalError?: unknown,
    retryAfter?: number
  ) {
    super(message, statusCode, originalError);
    this.name = 'AIRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/** Error thrown when text expected to contain JSON cannot be parsed. */
export class AIResponseParseError extends Error {
  rawResponse: string;

  constructor(message: string, rawResponse: string) {
    super(message);
    this.name = 'AIResponseParseError';
    this.rawResponse = rawResponse;
  }
}

/** Error thrown when Anthropic is overloaded and requests should be retried. */
export class AIOverloadError extends AIRequestError {
  constructor(
    message = 'Claude API is temporarily overloaded',
    statusCode = 529,
    originalError?: unknown
  ) {
    super(message, statusCode, originalError);
    this.name = 'AIOverloadError';
  }
}

/** Convert unknown Anthropic/runtime failures to the project-specific error hierarchy. */
export function toAIError(error: unknown): Error {
  if (
    error instanceof AIClientError ||
    error instanceof AIRequestError ||
    error instanceof AIResponseParseError
  ) {
    return error;
  }

  const statusCode =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: number }).status)
      : undefined;
  const message = error instanceof Error ? error.message : 'Unknown AI request failure';

  if (statusCode === 429) {
    return new AIRateLimitError(message, statusCode, error);
  }

  if (statusCode === 529) {
    return new AIOverloadError(message, statusCode, error);
  }

  return new AIRequestError(message, statusCode, error);
}
