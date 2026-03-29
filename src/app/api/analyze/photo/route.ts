import { NextRequest, NextResponse } from 'next/server';
import { sendVisionMessageForJSON } from '@/lib/ai';
import { PHOTO_ANALYSIS_SYSTEM, PHOTO_ANALYSIS_USER, fillTemplate } from '@/lib/ai/prompts';
import type { PhotoAnalyzeResponse } from '@/types';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const VALID_DIRECTIONS = new Set(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
const VALID_SIZES = new Set(['small', 'medium', 'large']);

type AllowedMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const RAW_SIGNATURES: Record<string, AllowedMediaType> = {
  '/9j/': 'image/jpeg',
  iVBOR: 'image/png',
  R0lG: 'image/gif',
  UklG: 'image/webp',
};

function parseImage(input: string): { data: string; mediaType: AllowedMediaType } | null {
  // Handle data URI format: data:image/png;base64,....
  const dataUriMatch = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (dataUriMatch) {
    const mime = dataUriMatch[1];
    if (!ALLOWED_FORMATS.has(mime)) return null;
    return { data: dataUriMatch[2], mediaType: mime as AllowedMediaType };
  }

  // Handle raw base64 by signature detection
  for (const [prefix, type] of Object.entries(RAW_SIGNATURES)) {
    if (input.startsWith(prefix)) return { data: input, mediaType: type };
  }

  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeResponse(raw: PhotoAnalyzeResponse): PhotoAnalyzeResponse {
  return {
    windows: raw.windows.flatMap((w) => {
      if (!VALID_DIRECTIONS.has(w.direction) || !VALID_SIZES.has(w.size)) {
        return [];
      }

      return [
        {
          ...w,
          confidence: clamp(w.confidence, 0, 1),
          position: {
            x: clamp(w.position.x, 0, 1),
            y: clamp(w.position.y, 0, 1),
          },
        },
      ];
    }),
    roomLayout: {
      width: Math.max(raw.roomLayout.width, 1),
      height: Math.max(raw.roomLayout.height, 1),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body as { images?: string[] };

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: '이미지를 첨부해주세요', code: 'NO_IMAGES' },
        { status: 400 }
      );
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `최대 ${MAX_IMAGES}장까지 업로드 가능합니다`, code: 'TOO_MANY_IMAGES' },
        { status: 400 }
      );
    }

    const visionImages: Array<{ data: string; mediaType: AllowedMediaType }> = [];

    for (const img of images) {
      const parsed = parseImage(img);
      if (!parsed) {
        return NextResponse.json(
          { error: '지원하지 않는 이미지 형식입니다 (JPEG, PNG, GIF, WebP만 지원)', code: 'INVALID_IMAGE_FORMAT' },
          { status: 400 }
        );
      }

      const sizeBytes = Math.ceil((parsed.data.length * 3) / 4);
      if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          { error: '이미지 크기는 10MB 이하여야 합니다', code: 'IMAGE_TOO_LARGE' },
          { status: 400 }
        );
      }

      visionImages.push(parsed);
    }

    const rawResult = await sendVisionMessageForJSON<PhotoAnalyzeResponse>({
      images: visionImages,
      prompt: fillTemplate(PHOTO_ANALYSIS_USER, { spaceName: '분석 대상 공간' }),
      systemPrompt: PHOTO_ANALYSIS_SYSTEM,
    });

    const normalizedResult = normalizeResponse(rawResult);

    if (!normalizedResult.windows || normalizedResult.windows.length === 0) {
      return NextResponse.json(
        {
          error: '사진에서 창문을 찾지 못했어요. 방향을 직접 입력해주세요.',
          code: 'NO_WINDOWS_DETECTED',
          suggestion: 'manual_input',
        },
        { status: 422 }
      );
    }

    return NextResponse.json(normalizedResult);
  } catch (error) {
    console.error('Photo analysis failed:', error);
    return NextResponse.json(
      { error: '사진 분석에 실패했어요. 다시 시도해주세요.', code: 'AI_SERVICE_ERROR' },
      { status: 500 }
    );
  }
}
