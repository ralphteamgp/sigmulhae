import type { Direction, WindowSize, SunlightGrade, Position, Area } from './common';

/** 창문 정보 (DOM Window와 충돌 방지를 위해 SpaceWindow로 네이밍) */
export interface SpaceWindow {
  /** 고유 ID */
  id: string;
  /** 8방위 방향 */
  direction: Direction;
  /** 창문 크기 */
  size: WindowSize;
  /** 평면도 내 좌표 */
  position: Position;
}

/** 채광 구역 */
export interface SunlightZone {
  /** 고유 ID */
  id: string;
  /** 채광 등급 (강 / 중 / 약) */
  grade: SunlightGrade;
  /** 평면도 내 영역 */
  area: Area;
}

/** 분석된 공간 정보 */
export interface Space {
  /** 고유 ID (UUID) */
  id: string;
  /** 공간 이름 (예: "거실", "침실") */
  name: string;
  /** 주소 (주소 입력 플로우 시) */
  address?: string;
  /** 동 */
  dong?: string;
  /** 호 */
  ho?: string;
  /** 호갱노노 평면도 이미지 (base64) */
  floorplanImage?: string;
  /** 건물 방위 각도 (0~360, 북=0) */
  buildingAzimuth?: number;
  /** 창문 정보 배열 */
  windows: SpaceWindow[];
  /** 채광 구역 */
  sunlightZones: SunlightZone[];
  /** 생성 시각 */
  createdAt: Date;
}
