import { NextRequest, NextResponse } from 'next/server';
import { sendMessageForJSON } from '@/lib/ai';
import { PLANT_RECOMMEND_SYSTEM, PLANT_RECOMMEND_USER, fillTemplate } from '@/lib/ai/prompts';
import { getPlantsByLightNeed, loadPlantSpecies } from '@/lib/db/plant-data';
import type { SunlightGrade } from '@/types/common';
import type { PlantRecommendResponse, PlantRecommendation } from '@/types/api';
import type { PlantSpecies } from '@/types/plant';

const VALID_GRADES = new Set(['strong', 'medium', 'weak']);

interface AIRecommendResult {
  recommendations: Array<{
    speciesId: string;
    matchScore: number;
    reason: string;
    suggestedPosition?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sunlightGrade, beginnerOnly } = body as {
      sunlightGrade?: string;
      beginnerOnly?: boolean;
    };

    if (!sunlightGrade || !VALID_GRADES.has(sunlightGrade)) {
      return NextResponse.json(
        { error: '유효한 채광 등급을 입력해주세요 (strong/medium/weak)', code: 'INVALID_GRADE' },
        { status: 400 }
      );
    }

    const grade = sunlightGrade as SunlightGrade;

    // 후보 식물 필터링
    let candidates = getPlantsByLightNeed(grade);
    if (beginnerOnly) {
      candidates = candidates.filter((p) => p.difficulty === 'easy');
    }

    // 후보가 적으면 인접 등급도 포함
    if (candidates.length < 3) {
      const allPlants = loadPlantSpecies();
      const additional = allPlants.filter(
        (p) => !candidates.some((c) => c.id === p.id) && (beginnerOnly ? p.difficulty === 'easy' : true)
      );
      candidates = [...candidates, ...additional.slice(0, 5 - candidates.length)];
    }

    const candidatesSummary = candidates
      .map((p) => `${p.id}: ${p.name} (${p.scientificName}), 난이도: ${p.difficulty}, 효과: ${p.effects.join(', ')}`)
      .join('\n');

    // Claude API로 추천 생성
    try {
      const aiResult = await sendMessageForJSON<AIRecommendResult>({
        prompt: fillTemplate(PLANT_RECOMMEND_USER, {
          sunlightGrade: grade,
          beginnerOnly: String(beginnerOnly ?? false),
          plantCandidates: candidatesSummary,
        }),
        systemPrompt: PLANT_RECOMMEND_SYSTEM,
      });

      const speciesMap = new Map(candidates.map((p) => [p.id, p]));
      const plants: PlantRecommendation[] = aiResult.recommendations
        .filter((r) => speciesMap.has(r.speciesId))
        .map((r) => ({
          species: speciesMap.get(r.speciesId) as PlantSpecies,
          matchScore: Math.min(1, Math.max(0, r.matchScore)),
          reason: r.reason,
          suggestedPosition: r.suggestedPosition,
        }));

      const response: PlantRecommendResponse = { plants };
      return NextResponse.json(response);
    } catch {
      // AI 실패 시 기본 추천 반환
      const fallbackPlants: PlantRecommendation[] = candidates.slice(0, 5).map((p) => ({
        species: p,
        matchScore: 0.7,
        reason: `${p.name}은(는) ${grade === 'strong' ? '밝은 곳' : grade === 'medium' ? '간접광' : '음지'}에서 잘 자라요.`,
      }));

      return NextResponse.json({ plants: fallbackPlants });
    }
  } catch (error) {
    console.error('Plant recommendation failed:', error);
    return NextResponse.json(
      { error: '식물 추천에 실패했어요', code: 'RECOMMENDATION_ERROR' },
      { status: 500 }
    );
  }
}
