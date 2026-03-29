import { describe, expect, it } from 'vitest';
import {
  ADDRESS_PARSE_SYSTEM,
  ADDRESS_PARSE_USER,
  FLOORPLAN_ANALYSIS_SYSTEM,
  FLOORPLAN_ANALYSIS_USER,
  PHOTO_ANALYSIS_SYSTEM,
  PHOTO_ANALYSIS_USER,
  PLANT_RECOMMEND_SYSTEM,
  PLANT_RECOMMEND_USER,
  fillTemplate,
} from '@/lib/ai/prompts';

describe('prompt helpers', () => {
  it('fills templates with provided variables and leaves unknown placeholders intact', () => {
    expect(fillTemplate('Hello {{name}}', { name: 'World' })).toBe('Hello World');
    expect(fillTemplate('{{a}} and {{b}}', { a: 'X', b: 'Y' })).toBe('X and Y');
    expect(fillTemplate('Hello {{name}}', {})).toBe('Hello ');
  });

  it('ships non-empty prompt constants for each planned workflow', () => {
    expect([
      PHOTO_ANALYSIS_SYSTEM,
      PHOTO_ANALYSIS_USER,
      ADDRESS_PARSE_SYSTEM,
      ADDRESS_PARSE_USER,
      FLOORPLAN_ANALYSIS_SYSTEM,
      FLOORPLAN_ANALYSIS_USER,
      PLANT_RECOMMEND_SYSTEM,
      PLANT_RECOMMEND_USER,
    ].every((prompt) => prompt.trim().length > 0)).toBe(true);
  });
});
