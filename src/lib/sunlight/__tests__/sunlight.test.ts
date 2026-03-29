import { describe, expect, it } from 'vitest';
import { getDailySolarPositions, getSunTimes } from '../solar';
import { calculateDirectSunlightHours } from '../direct-sunlight';
import { calculateSunlightGrade } from '../grade';
import { mapSunlightZones } from '../zone-mapper';
import type { SpaceWindow } from '@/types/space';

// 서울 좌표
const SEOUL_LAT = 37.5665;
const SEOUL_LNG = 126.978;
const EQUINOX = new Date(2026, 2, 20); // 3월 20일 춘분

describe('태양 위치 계산', () => {
  it('서울 춘분 태양 위치가 유효한 범위', () => {
    const positions = getDailySolarPositions(SEOUL_LAT, SEOUL_LNG, EQUINOX);
    expect(positions.length).toBeGreaterThan(0);

    for (const { position } of positions) {
      expect(position.altitudeDeg).toBeGreaterThan(0);
      expect(position.azimuthDeg).toBeGreaterThanOrEqual(0);
      expect(position.azimuthDeg).toBeLessThan(360);
    }
  });

  it('일출/일몰 시각 반환', () => {
    const times = getSunTimes(SEOUL_LAT, SEOUL_LNG, EQUINOX);
    expect(times.sunrise).toBeInstanceOf(Date);
    expect(times.sunset).toBeInstanceOf(Date);
    expect(times.sunset.getTime()).toBeGreaterThan(times.sunrise.getTime());
  });
});

describe('직달일사 시간 계산', () => {
  const positions = getDailySolarPositions(SEOUL_LAT, SEOUL_LNG, EQUINOX);

  it('남향 큰 창문: 높은 직달일사', () => {
    const window: SpaceWindow = {
      id: 'w1', direction: 'S', size: 'large',
      position: { x: 0.5, y: 0.1 },
    };
    const hours = calculateDirectSunlightHours(window, positions);
    expect(hours).toBeGreaterThan(2);
  });

  it('북향 작은 창문: 낮은 직달일사', () => {
    const window: SpaceWindow = {
      id: 'w2', direction: 'N', size: 'small',
      position: { x: 0.5, y: 0.9 },
    };
    const hours = calculateDirectSunlightHours(window, positions);
    expect(hours).toBeLessThan(2);
  });

  it('창문 크기에 따라 보정계수 적용', () => {
    const base: Omit<SpaceWindow, 'size'> = {
      id: 'w', direction: 'S', position: { x: 0.5, y: 0.1 },
    };
    const largeh = calculateDirectSunlightHours(
      { ...base, size: 'large' }, positions
    );
    const smallh = calculateDirectSunlightHours(
      { ...base, size: 'small' }, positions
    );
    expect(largeh).toBeGreaterThan(smallh);
  });
});

describe('채광 등급 산출', () => {
  it('4시간 이상 → strong', () => {
    expect(calculateSunlightGrade(4)).toBe('strong');
    expect(calculateSunlightGrade(6)).toBe('strong');
  });

  it('2~4시간 → medium', () => {
    expect(calculateSunlightGrade(2)).toBe('medium');
    expect(calculateSunlightGrade(3.5)).toBe('medium');
  });

  it('2시간 미만 → weak', () => {
    expect(calculateSunlightGrade(1)).toBe('weak');
    expect(calculateSunlightGrade(0)).toBe('weak');
  });
});

describe('채광 구역 매핑', () => {
  it('창문별 구역 생성', () => {
    const windows: SpaceWindow[] = [
      { id: 'w1', direction: 'S', size: 'large', position: { x: 0.5, y: 0.1 } },
      { id: 'w2', direction: 'N', size: 'small', position: { x: 0.5, y: 0.9 } },
    ];

    const grades = new Map([
      ['w1', 'strong' as const],
      ['w2', 'weak' as const],
    ]);

    const zones = mapSunlightZones(windows, grades);
    expect(zones).toHaveLength(2);
    expect(zones[0].grade).toBe('strong');
    expect(zones[1].grade).toBe('weak');
    expect(zones[0].area.width).toBeGreaterThan(zones[1].area.width);
  });
});
