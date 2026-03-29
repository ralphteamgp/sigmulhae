import { NextRequest, NextResponse } from 'next/server';
import { sendVisionMessageForJSON, sendMessageForJSON } from '@/lib/ai';
import {
  FLOORPLAN_ANALYSIS_SYSTEM,
  FLOORPLAN_ANALYSIS_USER,
  fillTemplate,
} from '@/lib/ai/prompts';
import { crawlFloorplan } from '@/lib/crawler/hogangnono';
import type { FloorplanAnalyzeResponse } from '@/types';
import type { PhotoAnalyzeWindow } from '@/types/api';

interface AIFloorplanResult {
  windows: PhotoAnalyzeWindow[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, dong, ho } = body as {
      address?: string;
      dong?: string;
      ho?: string;
    };

    if (!address || address.trim().length === 0) {
      return NextResponse.json(
        { error: '주소를 입력해주세요', code: 'EMPTY_ADDRESS' },
        { status: 400 }
      );
    }

    // 호갱노노 크롤링 시도
    const crawlResult = await crawlFloorplan(address);

    let response: FloorplanAnalyzeResponse;

    if (crawlResult.success && crawlResult.floorplanImage) {
      // 경로 A: 평면도 기반 분석
      try {
        const aiResult = await sendVisionMessageForJSON<AIFloorplanResult>({
          images: [
            {
              data: crawlResult.floorplanImage,
              mediaType: 'image/png',
            },
          ],
          prompt: fillTemplate(FLOORPLAN_ANALYSIS_USER, {
            azimuth: String(crawlResult.buildingAzimuth ?? '미확인'),
            buildingInfo: '건축물대장 정보 미제공',
            dong: dong ?? '미지정',
            ho: ho ?? '미지정',
          }),
          systemPrompt: FLOORPLAN_ANALYSIS_SYSTEM,
        });

        response = {
          floorplanImage: crawlResult.floorplanImage,
          buildingAzimuth: crawlResult.buildingAzimuth,
          windows: aiResult.windows,
          analysisSource: 'floorplan',
        };
      } catch {
        // AI 분석 실패 → regulation_only 폴백
        response = await regulationOnlyFallback(address, dong, ho);
      }
    } else {
      // 경로 B: 크롤링 실패 → 건축법령만으로 분석
      response = await regulationOnlyFallback(address, dong, ho);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Floorplan analysis failed:', error);
    return NextResponse.json(
      { error: '평면도 분석에 실패했어요', code: 'AI_SERVICE_ERROR' },
      { status: 500 }
    );
  }
}

async function regulationOnlyFallback(
  address: string,
  dong?: string,
  ho?: string
): Promise<FloorplanAnalyzeResponse> {
  try {
    const result = await sendMessageForJSON<AIFloorplanResult>({
      prompt: fillTemplate(FLOORPLAN_ANALYSIS_USER, {
        azimuth: '미확인',
        buildingInfo: `주소: ${address}`,
        dong: dong ?? '미지정',
        ho: ho ?? '미지정',
      }),
      systemPrompt: `${FLOORPLAN_ANALYSIS_SYSTEM}\n\n평면도가 없으므로 건축법령 규정과 일반적인 아파트 구조 패턴을 기반으로 추정하세요. confidence는 0.3 이하로 설정하세요.`,
    });

    return {
      windows: result.windows,
      analysisSource: 'regulation_only',
    };
  } catch {
    return {
      windows: [],
      analysisSource: 'regulation_only',
    };
  }
}
