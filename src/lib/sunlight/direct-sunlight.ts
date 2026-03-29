import type { SpaceWindow } from '@/types/space';
import type { Direction, WindowSize } from '@/types/common';
import type { SolarPosition } from './solar';

/** 8방위 → 방위각 중심 (도, 북=0) */
const DIRECTION_CENTER: Record<Direction, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

/** 창문 크기별 보정계수 */
const SIZE_FACTOR: Record<WindowSize, number> = {
  large: 1.0,
  medium: 0.7,
  small: 0.4,
};

/** 방위각 간 각도 차이 (0~180) */
function angleDifference(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/** 창문에 대한 직달일사 시간 계산 (hours) */
export function calculateDirectSunlightHours(
  window: SpaceWindow,
  solarPositions: Array<{ time: Date; position: SolarPosition }>,
  intervalMinutes = 30
): number {
  const windowAzimuth = DIRECTION_CENTER[window.direction];
  const sizeFactor = SIZE_FACTOR[window.size];

  let sunlightMinutes = 0;

  for (const { position } of solarPositions) {
    // 태양 고도 > 0 (이미 필터됨) + 창문 방위각 범위 내 (±45도)
    const diff = angleDifference(position.azimuthDeg, windowAzimuth);
    if (diff <= 45 && position.altitudeDeg > 0) {
      sunlightMinutes += intervalMinutes;
    }
  }

  return (sunlightMinutes / 60) * sizeFactor;
}
