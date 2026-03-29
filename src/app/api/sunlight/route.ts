import { NextRequest, NextResponse } from 'next/server';
import type { SpaceWindow } from '@/types/space';
import type { SunlightGrade } from '@/types/common';
import { getDailySolarPositions } from '@/lib/sunlight/solar';
import { calculateDirectSunlightHours } from '@/lib/sunlight/direct-sunlight';
import { calculateSunlightGrade } from '@/lib/sunlight/grade';
import { mapSunlightZones } from '@/lib/sunlight/zone-mapper';

const VALID_DIRECTIONS = new Set(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
const VALID_SIZES = new Set(['small', 'medium', 'large']);

/** 기준 날짜: 춘분 (3월 20일) */
function getEquinoxDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 2, 20);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, windows } = body as {
      latitude?: number;
      longitude?: number;
      windows?: SpaceWindow[];
    };

    // 유효성 검증
    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: '유효하지 않은 좌표입니다', code: 'INVALID_COORDINATES' },
        { status: 400 }
      );
    }

    if (!windows || windows.length === 0) {
      return NextResponse.json(
        { error: '창문 정보가 필요합니다', code: 'NO_WINDOWS' },
        { status: 400 }
      );
    }

    for (const w of windows) {
      if (!VALID_DIRECTIONS.has(w.direction) || !VALID_SIZES.has(w.size)) {
        return NextResponse.json(
          { error: '유효하지 않은 창문 데이터입니다', code: 'INVALID_WINDOW_DATA' },
          { status: 400 }
        );
      }
    }

    // 태양 궤적 계산 (춘분 기준)
    const date = getEquinoxDate();
    const solarPositions = getDailySolarPositions(latitude, longitude, date);

    // 각 창문별 직달일사 시간 + 등급 계산
    const grades = new Map<string, SunlightGrade>();
    let maxHours = 0;

    for (const w of windows) {
      const hours = calculateDirectSunlightHours(w, solarPositions);
      const grade = calculateSunlightGrade(hours);
      grades.set(w.id, grade);
      if (hours > maxHours) maxHours = hours;
    }

    // 채광 구역 매핑
    const zones = mapSunlightZones(windows, grades);

    // 전체 등급: 최대 직달일사 기준
    const overallGrade = calculateSunlightGrade(maxHours);

    return NextResponse.json({ zones, overallGrade });
  } catch (error) {
    console.error('Sunlight calculation failed:', error);
    return NextResponse.json(
      { error: '채광 계산에 실패했어요', code: 'CALCULATION_ERROR' },
      { status: 500 }
    );
  }
}
