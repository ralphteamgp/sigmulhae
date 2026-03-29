/** 8방위 */
export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/** 채광 등급 (강 / 중 / 약) */
export type SunlightGrade = 'strong' | 'medium' | 'weak';

/** 창문 크기 */
export type WindowSize = 'small' | 'medium' | 'large';

/** 식물 키우기 난이도 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 케어 유형 (물주기 / 분갈이 / 영양제) */
export type CareType = 'water' | 'repot' | 'fertilize';

/** 2D 좌표 */
export interface Position {
  x: number;
  y: number;
}

/** 2D 영역 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
