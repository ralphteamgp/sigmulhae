import { describe, expect, it } from 'vitest';
import { AIResponseParseError } from '@/lib/ai/errors';
import { extractJSON } from '@/lib/ai/json-parser';

describe('extractJSON', () => {
  it('parses JSON from fenced code blocks', () => {
    expect(extractJSON<{ key: string }>('```json\n{"key":"val"}\n```')).toEqual({ key: 'val' });
  });

  it('parses plain JSON strings', () => {
    expect(extractJSON<{ key: string }>('{"key":"val"}')).toEqual({ key: 'val' });
  });

  it('extracts JSON embedded in surrounding text', () => {
    expect(extractJSON<{ key: string }>('Here is the result: {"key":"val"} Done.')).toEqual({
      key: 'val',
    });
  });

  it('throws AIResponseParseError for invalid or empty responses', () => {
    expect(() => extractJSON('not a json at all')).toThrow(AIResponseParseError);
    expect(() => extractJSON('')).toThrow(AIResponseParseError);
  });
});
