import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AIRequestError,
  AIResponseParseError,
  sendVisionMessageForJSON,
} from '@/lib/ai';
import { POST } from '@/app/api/analyze/photo/route';

vi.mock('@/lib/ai', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai')>('@/lib/ai');

  return {
    ...actual,
    sendVisionMessageForJSON: vi.fn(),
  };
});

const sendVisionMessageForJSONMock = vi.mocked(sendVisionMessageForJSON);

function buildRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/analyze/photo', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const pngImage = 'data:image/png;base64,aGVsbG8=';
const jpegImage = 'data:image/jpeg;base64,aGVsbG8=';
const webpImage = 'data:image/webp;base64,aGVsbG8=';

describe('POST /api/analyze/photo', () => {
  beforeEach(() => {
    sendVisionMessageForJSONMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_IMAGES when images are missing or empty', async () => {
    const missingResponse = await POST(buildRequest({}));
    const emptyResponse = await POST(buildRequest({ images: [] }));

    await expect(missingResponse.json()).resolves.toMatchObject({ code: 'NO_IMAGES' });
    expect(missingResponse.status).toBe(400);
    await expect(emptyResponse.json()).resolves.toMatchObject({ code: 'NO_IMAGES' });
    expect(emptyResponse.status).toBe(400);
  });

  it('rejects too many images, unsupported formats, and oversized payloads', async () => {
    const tooManyResponse = await POST(buildRequest({ images: new Array(6).fill(pngImage) }));
    const invalidFormatResponse = await POST(
      buildRequest({ images: ['data:image/bmp;base64,aGVsbG8='] })
    );
    const largePayloadResponse = await POST(
      buildRequest({ images: [`data:image/png;base64,${'a'.repeat(14_700_000)}`] })
    );

    expect(tooManyResponse.status).toBe(400);
    await expect(tooManyResponse.json()).resolves.toMatchObject({ code: 'TOO_MANY_IMAGES' });
    expect(invalidFormatResponse.status).toBe(400);
    await expect(invalidFormatResponse.json()).resolves.toMatchObject({
      code: 'INVALID_IMAGE_FORMAT',
    });
    expect(largePayloadResponse.status).toBe(400);
    await expect(largePayloadResponse.json()).resolves.toMatchObject({ code: 'IMAGE_TOO_LARGE' });
  });

  it('returns normalized analysis results for valid images', async () => {
    sendVisionMessageForJSONMock.mockResolvedValue({
      windows: [
        {
          direction: 'S',
          size: 'medium',
          confidence: 1.4,
          position: { x: -0.2, y: 2.1 },
        },
      ],
      roomLayout: { width: 12, height: 8 },
    });

    const response = await POST(buildRequest({ images: [pngImage, jpegImage, webpImage] }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sendVisionMessageForJSONMock).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          { data: 'aGVsbG8=', mediaType: 'image/png' },
          { data: 'aGVsbG8=', mediaType: 'image/jpeg' },
          { data: 'aGVsbG8=', mediaType: 'image/webp' },
        ],
      })
    );
    expect(body).toEqual({
      windows: [
        {
          direction: 'S',
          size: 'medium',
          confidence: 1,
          position: { x: 0, y: 1 },
        },
      ],
      roomLayout: { width: 12, height: 8 },
    });
  });

  it('returns 422 manual input guidance when no windows are detected', async () => {
    sendVisionMessageForJSONMock.mockResolvedValue({
      windows: [],
      roomLayout: { width: 10, height: 6 },
    });

    const response = await POST(buildRequest({ images: [pngImage] }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: 'NO_WINDOWS_DETECTED',
      suggestion: 'manual_input',
    });
  });

  it('returns AI_SERVICE_ERROR for request and parse failures', async () => {
    sendVisionMessageForJSONMock.mockRejectedValueOnce(new AIRequestError('timeout'));
    const requestFailureResponse = await POST(buildRequest({ images: [pngImage] }));

    sendVisionMessageForJSONMock.mockRejectedValueOnce(
      new AIResponseParseError('bad response', 'not json')
    );
    const parseFailureResponse = await POST(buildRequest({ images: [pngImage] }));

    expect(requestFailureResponse.status).toBe(500);
    await expect(requestFailureResponse.json()).resolves.toMatchObject({ code: 'AI_SERVICE_ERROR' });
    expect(parseFailureResponse.status).toBe(500);
    await expect(parseFailureResponse.json()).resolves.toMatchObject({ code: 'AI_SERVICE_ERROR' });
  });
});
