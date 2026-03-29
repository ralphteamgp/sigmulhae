import { describe, expectTypeOf, it } from 'vitest';
import type {
  BuildingTitleInfo,
  CareRecord,
  Direction,
  FloorplanAnalyzeResponse,
  PhotoAnalyzeRequest,
  PlantSpecies,
  Space,
  SpaceWindow,
  SunlightGrade,
} from '@/types';

describe('shared type contracts', () => {
  it('restricts directions to the supported eight-point compass', () => {
    expectTypeOf<Direction>().toEqualTypeOf<
      'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
    >();
  });

  it('maps sunlight grades and room windows correctly', () => {
    expectTypeOf<SunlightGrade>().toEqualTypeOf<'strong' | 'medium' | 'weak'>();
    expectTypeOf<Space['windows']>().toEqualTypeOf<SpaceWindow[]>();
    expectTypeOf<PhotoAnalyzeRequest['images']>().toEqualTypeOf<string[]>();
  });

  it('keeps critical API and seed contracts aligned with downstream stories', () => {
    expectTypeOf<FloorplanAnalyzeResponse['analysisSource']>().toEqualTypeOf<
      'floorplan' | 'regulation_only'
    >();
    expectTypeOf<PlantSpecies['effects']>().toEqualTypeOf<string[]>();
    expectTypeOf<CareRecord['type']>().toEqualTypeOf<
      'water' | 'repot' | 'fertilize'
    >();
    expectTypeOf<BuildingTitleInfo['totArea']>().toEqualTypeOf<number>();
  });
});
