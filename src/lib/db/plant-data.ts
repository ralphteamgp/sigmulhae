import type { PlantSpecies } from '@/types/plant';
import type { SunlightGrade, Difficulty } from '@/types/common';
import plantsJson from '@/data/plants.json';

const plantSpecies = plantsJson as PlantSpecies[];

/** 전체 식물 시드 데이터 반환 */
export function loadPlantSpecies(): PlantSpecies[] {
  return plantSpecies;
}

/** ID로 식물 종 조회 */
export function getPlantSpeciesById(id: string): PlantSpecies | undefined {
  return plantSpecies.find((p) => p.id === id);
}

/** 채광 등급으로 필터 */
export function getPlantsByLightNeed(grade: SunlightGrade): PlantSpecies[] {
  return plantSpecies.filter((p) => p.sunlightNeed === grade);
}

/** 난이도로 필터 */
export function getPlantsByDifficulty(difficulty: Difficulty): PlantSpecies[] {
  return plantSpecies.filter((p) => p.difficulty === difficulty);
}
