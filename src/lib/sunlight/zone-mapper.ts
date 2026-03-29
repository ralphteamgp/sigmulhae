import type { SpaceWindow, SunlightZone } from '@/types/space';
import type { SunlightGrade, WindowSize } from '@/types/common';

/** 창문 크기별 채광 구역 반경 (정규화 좌표 기준) */
const ZONE_RADIUS: Record<WindowSize, number> = {
  large: 0.3,
  medium: 0.2,
  small: 0.1,
};

/** 창문 정보 + 등급으로 채광 구역 매핑 */
export function mapSunlightZones(
  windows: SpaceWindow[],
  grades: Map<string, SunlightGrade>
): SunlightZone[] {
  return windows.map((w) => {
    const grade = grades.get(w.id) ?? 'weak';
    const radius = ZONE_RADIUS[w.size];

    return {
      id: crypto.randomUUID(),
      grade,
      area: {
        x: Math.max(0, w.position.x - radius),
        y: Math.max(0, w.position.y - radius),
        width: radius * 2,
        height: radius * 2,
      },
    };
  });
}
