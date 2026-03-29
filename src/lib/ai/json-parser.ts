import { AIResponseParseError } from './errors';

const JSON_CODE_BLOCK_RE = /```(?:json)?\s*([\s\S]*?)\s*```/i;

function cleanInput(text: string) {
  return text.replace(/^\uFEFF/, '').trim();
}

function parseCandidate<T>(candidate: string, rawText: string): T {
  try {
    return JSON.parse(candidate) as T;
  } catch {
    throw new AIResponseParseError('Failed to parse AI response as JSON', rawText);
  }
}

function extractJSONObjectSlice(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return undefined;
  }

  return text.slice(start, end + 1);
}

/** Extract a JSON object from plain text or fenced markdown code blocks. */
export function extractJSON<T>(text: string): T {
  const cleaned = cleanInput(text);

  if (!cleaned) {
    throw new AIResponseParseError('AI response was empty', text);
  }

  const fencedMatch = cleaned.match(JSON_CODE_BLOCK_RE);
  if (fencedMatch) {
    return parseCandidate<T>(fencedMatch[1].trim(), text);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const objectSlice = extractJSONObjectSlice(cleaned);
    if (objectSlice) {
      return parseCandidate<T>(objectSlice, text);
    }

    throw new AIResponseParseError('Failed to find JSON in AI response', text);
  }
}

export const parseJSONResponse = extractJSON;
