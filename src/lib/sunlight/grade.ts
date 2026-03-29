import type { SunlightGrade } from '@/types/common';

/** 직달일사 시간 → 채광 등급 산출 */
export function calculateSunlightGrade(directSunlightHours: number): SunlightGrade {
  if (directSunlightHours >= 4) return 'strong';
  if (directSunlightHours >= 2) return 'medium';
  return 'weak';
}
