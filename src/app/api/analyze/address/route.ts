import { NextRequest, NextResponse } from 'next/server';
import { sendMessageForJSON } from '@/lib/ai';
import { ADDRESS_PARSE_SYSTEM, ADDRESS_PARSE_USER, fillTemplate } from '@/lib/ai/prompts';
import { fetchBuildingInfo } from '@/lib/public-api/building-register';
import type { AddressAnalyzeResponse, AddressCandidate } from '@/types';
import type { BuildingTitleInfo } from '@/types/external';

interface AIAddressResult {
  candidates: Array<{
    address: string;
    jibunAddress?: string;
    sigunguCd?: string;
    bjdongCd?: string;
    bun?: string;
    ji?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string; dong?: string; ho?: string };

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: '주소를 입력해주세요', code: 'EMPTY_QUERY' },
        { status: 400 }
      );
    }

    // Claude API로 주소 정제
    let aiResult: AIAddressResult;
    try {
      aiResult = await sendMessageForJSON<AIAddressResult>({
        prompt: fillTemplate(ADDRESS_PARSE_USER, { query }),
        systemPrompt: ADDRESS_PARSE_SYSTEM,
      });
    } catch {
      return NextResponse.json(
        { error: '주소 분석에 실패했어요. 다시 시도해주세요.', code: 'AI_SERVICE_ERROR' },
        { status: 500 }
      );
    }

    if (!aiResult.candidates || aiResult.candidates.length === 0) {
      return NextResponse.json(
        { error: '주소를 찾지 못했어요. 더 구체적으로 입력해주세요.', code: 'NO_ADDRESS_FOUND' },
        { status: 404 }
      );
    }

    const candidates: AddressCandidate[] = aiResult.candidates.map((c) => ({
      address: c.address,
      jibunAddress: c.jibunAddress,
    }));

    // 건축물대장 조회 시도 (첫 번째 후보 기준)
    let buildingInfo: BuildingTitleInfo | undefined;
    const first = aiResult.candidates[0];

    if (first.sigunguCd && first.bjdongCd) {
      try {
        const items = await fetchBuildingInfo({
          sigunguCd: first.sigunguCd,
          bjdongCd: first.bjdongCd,
          bun: first.bun,
          ji: first.ji,
        });
        buildingInfo = items[0];
      } catch {
        // 건축물대장 API 실패 → fallback (후보 리스트만 반환)
        return NextResponse.json(
          {
            error: '건물 정보를 불러오지 못했어요',
            code: 'BUILDING_API_ERROR',
            fallback: 'manual_input',
            candidates,
          },
          { status: 502 }
        );
      }
    }

    const response: AddressAnalyzeResponse = {
      candidates,
      buildingInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Address analysis failed:', error);
    return NextResponse.json(
      { error: '주소 분석에 실패했어요', code: 'AI_SERVICE_ERROR' },
      { status: 500 }
    );
  }
}
