import type { Direction, SunlightGrade, WindowSize } from './common';
import type { PlantSpecies } from './plant';
import type { BuildingTitleInfo } from './external';
import type { SpaceWindow, SunlightZone } from './space';

/** 사진 분석 요청 payload. 최대 5장의 base64 이미지를 전달한다. */
export interface PhotoAnalyzeRequest {
  /** base64로 인코딩된 이미지 배열 */
  images: string[];
}

/** 사진 기반 창문 분석 응답의 개별 창문 결과. */
export interface PhotoAnalyzeWindow {
  /** 추정된 8방위 */
  direction: Direction;
  /** 추정된 창문 크기 */
  size: WindowSize;
  /** 분석 신뢰도 (0~1) */
  confidence: number;
  /** 평면도 기준 좌표 */
  position: {
    x: number;
    y: number;
  };
}

/** 사진 분석 응답. */
export interface PhotoAnalyzeResponse {
  /** 분석된 창문 목록 */
  windows: PhotoAnalyzeWindow[];
  /** AI가 추정한 방 레이아웃 */
  roomLayout: {
    width: number;
    height: number;
  };
}

/** 주소 분석 요청 payload. */
export interface AddressAnalyzeRequest {
  /** 사용자가 입력한 자유형 주소 */
  query: string;
  /** 선택된 동 정보 */
  dong?: string;
  /** 선택된 호 정보 */
  ho?: string;
}

/** 주소 후보 항목. */
export interface AddressCandidate {
  /** 정제된 주소 */
  address: string;
  /** 지번 주소 */
  jibunAddress?: string;
}

/** 주소 분석 응답. */
export interface AddressAnalyzeResponse {
  /** LLM이 정제한 후보 주소 목록 */
  candidates: AddressCandidate[];
  /** 건축물대장 조회 결과의 핵심 필드 */
  buildingInfo?: BuildingTitleInfo;
}

/** 평면도 분석 요청 payload. */
export interface FloorplanAnalyzeRequest {
  /** 확정된 주소 */
  address: string;
  /** 동 정보 */
  dong?: string;
  /** 호 정보 */
  ho?: string;
}

/** 평면도 분석 소스 구분값. */
export type FloorplanAnalysisSource = 'floorplan' | 'regulation_only';

/** 평면도 분석 응답. */
export interface FloorplanAnalyzeResponse {
  /** 크롤링한 평면도 이미지의 base64 표현 */
  floorplanImage?: string;
  /** 건물 방위각 (북=0) */
  buildingAzimuth?: number;
  /** 분석된 창문 목록 */
  windows: PhotoAnalyzeWindow[];
  /** 평면도 사용 여부 */
  analysisSource: FloorplanAnalysisSource;
}

/** 채광 계산 요청 payload. */
export interface SunlightRequest {
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
  /** 공간 창문 목록 */
  windows: SpaceWindow[];
}

/** 채광 계산 응답. */
export interface SunlightResponse {
  /** 계산된 채광 구역들 */
  zones: SunlightZone[];
  /** 공간 전체 채광 등급 */
  overallGrade: SunlightGrade;
}

/** 식물 추천 요청 payload. */
export interface PlantRecommendRequest {
  /** 기준 채광 등급 */
  sunlightGrade: SunlightGrade;
  /** 초보자 필터 여부 */
  beginnerOnly: boolean;
}

/** 식물 추천 카드의 단일 항목. */
export interface PlantRecommendation {
  /** 식물 종 정보 */
  species: PlantSpecies;
  /** 적합도 점수 (0~1) */
  matchScore: number;
  /** 추천 이유 */
  reason: string;
  /** 추천 배치 텍스트 */
  suggestedPosition?: string;
}

/** 식물 추천 응답. */
export interface PlantRecommendResponse {
  /** 추천된 식물 목록 */
  plants: PlantRecommendation[];
}
