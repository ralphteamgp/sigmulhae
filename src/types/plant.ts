import type { SunlightGrade, Difficulty, CareType, Position } from './common';

/** 식물 종(시드 데이터 스키마) */
export interface PlantSpecies {
  /** 고유 ID */
  id: string;
  /** 이름 (예: "몬스테라") */
  name: string;
  /** 학명 (예: "Monstera deliciosa") */
  scientificName: string;
  /** 필요 일조량 */
  sunlightNeed: SunlightGrade;
  /** 키우기 난이도 */
  difficulty: Difficulty;
  /** 물주기 간격 (일) */
  waterIntervalDays: number;
  /** 효과 (예: ["공기정화", "인테리어 포인트"]) */
  effects: string[];
  /** 설명 */
  description: string;
}

/** 등록된 식물 */
export interface Plant {
  /** 고유 ID */
  id: string;
  /** plants.json 참조 ID */
  speciesId: string;
  /** 배치된 공간 ID */
  spaceId: string;
  /** 평면도 내 배치 좌표 */
  position: Position;
  /** 등록 시각 */
  registeredAt: Date;
  /** 마지막 케어 시각 */
  lastCaredAt: Date;
}

/** 케어 기록 */
export interface CareRecord {
  /** 고유 ID */
  id: string;
  /** 식물 ID */
  plantId: string;
  /** 케어 유형 (물주기 / 분갈이 / 영양제) */
  type: CareType;
  /** 케어 날짜 */
  date: Date;
  /** 메모 */
  note?: string;
}
