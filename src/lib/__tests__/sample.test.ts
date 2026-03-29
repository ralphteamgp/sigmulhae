import { describe, expect, it } from 'vitest';
import { getAppName } from '@/lib/utils/app-name';

describe('getAppName', () => {
  it('returns the PlantFit workspace name through the alias path', () => {
    expect(getAppName()).toBe('식물식물해');
  });
});
