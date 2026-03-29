import { describe, expect, it } from 'vitest';
import {
  loadPlantSpecies,
  getPlantSpeciesById,
  getPlantsByLightNeed,
  getPlantsByDifficulty,
} from '../plant-data';

describe('식물 시드 데이터', () => {
  const allPlants = loadPlantSpecies();

  it('20종 이상 식물 데이터 존재', () => {
    expect(allPlants.length).toBeGreaterThanOrEqual(20);
  });

  it('모든 ID가 유니크', () => {
    const ids = allPlants.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 waterIntervalDays > 0', () => {
    for (const plant of allPlants) {
      expect(plant.waterIntervalDays).toBeGreaterThan(0);
    }
  });

  it('PlantSpecies 필드 존재 (8개)', () => {
    for (const plant of allPlants) {
      expect(plant.id).toBeDefined();
      expect(plant.name).toBeDefined();
      expect(plant.scientificName).toBeDefined();
      expect(plant.sunlightNeed).toBeDefined();
      expect(plant.difficulty).toBeDefined();
      expect(plant.waterIntervalDays).toBeDefined();
      expect(plant.effects).toBeDefined();
      expect(plant.description).toBeDefined();
    }
  });

  it('채광 등급별 분포: strong 7+, medium 8+, weak 5+', () => {
    expect(getPlantsByLightNeed('strong').length).toBeGreaterThanOrEqual(7);
    expect(getPlantsByLightNeed('medium').length).toBeGreaterThanOrEqual(8);
    expect(getPlantsByLightNeed('weak').length).toBeGreaterThanOrEqual(5);
  });

  it('난이도별 분포: easy 10+, medium 7+, hard 3+', () => {
    expect(getPlantsByDifficulty('easy').length).toBeGreaterThanOrEqual(10);
    expect(getPlantsByDifficulty('medium').length).toBeGreaterThanOrEqual(7);
    expect(getPlantsByDifficulty('hard').length).toBeGreaterThanOrEqual(3);
  });

  it('getPlantSpeciesById: 존재하는 ID 조회', () => {
    const monstera = getPlantSpeciesById('monstera');
    expect(monstera).toBeDefined();
    expect(monstera!.name).toBe('몬스테라');
    expect(monstera!.scientificName).toBe('Monstera deliciosa');
  });

  it('getPlantSpeciesById: 없는 ID 조회시 undefined', () => {
    expect(getPlantSpeciesById('nonexistent')).toBeUndefined();
  });

  it('필수 식물 10종 포함', () => {
    const requiredIds = [
      'monstera', 'pothos', 'sansevieria', 'rubber-plant', 'peace-lily',
      'areca-palm', 'pachira', 'dracaena', 'cactus', 'echeveria',
    ];
    for (const id of requiredIds) {
      expect(getPlantSpeciesById(id)).toBeDefined();
    }
  });
});
