# 0002 - TypeScript 공유 타입 정의 TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

| # | 시나리오 | 검증 방법 | 기대 결과 | 상태 |
|---|----------|-----------|-----------|------|
| T-0002-01 | 타입 컴파일 | `npx tsc --noEmit` | 타입 에러 0건 | ⬜ |
| T-0002-02 | index.ts re-export | `import { Space, Plant } from '@/types'` | 정상 import | ⬜ |
| T-0002-03 | Direction 타입 유효성 | `const d: Direction = 'N'` (유효), `'X'` (무효) | 타입 체크 pass/fail | ⬜ |
| T-0002-04 | SunlightGrade 유효성 | `const g: SunlightGrade = 'strong'` (유효) | 타입 체크 pass | ⬜ |
| T-0002-05 | Space 필수 필드 | `const s: Space = {}` (필수 필드 누락) | 타입 에러 발생 | ⬜ |
| T-0002-06 | Space 선택 필드 | `Space` 객체에서 address, dong, ho 생략 | 타입 에러 없음 | ⬜ |
| T-0002-07 | SpaceWindow 네이밍 | `SpaceWindow` import 확인 | DOM Window와 충돌 없음 | ⬜ |
| T-0002-08 | API 타입 쌍 | 각 엔드포인트 Request/Response 존재 확인 | 5쌍 모두 존재 | ⬜ |
| T-0002-09 | BuildingTitleInfo 필드 | 건축물대장 응답 필드 스펙 대조 | 16개 주요 필드 존재 | ⬜ |
| T-0002-10 | PlantSpecies 필드 | 시드 데이터 스키마 대조 | 8개 필드 존재 | ⬜ |
| T-0002-11 | CareRecord.type 제한 | `type: 'invalid'` 할당 시도 | 타입 에러 발생 | ⬜ |
| T-0002-12 | FloorplanAnalyzeResponse.analysisSource | `'floorplan' \| 'regulation_only'` 확인 | 2개 리터럴만 허용 | ⬜ |

## 타입 단위 테스트 (Vitest)

타입 검증은 `vitest`의 `expectTypeOf`를 활용하여 자동화:

```typescript
// src/types/__tests__/types.test.ts
import { expectTypeOf } from 'vitest';
import type { Direction, Space, SpaceWindow, PhotoAnalyzeRequest } from '@/types';

describe('공유 타입 정의', () => {
  it('Direction은 8방위만 허용', () => {
    expectTypeOf<Direction>().toEqualTypeOf<'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'>();
  });

  it('Space.windows는 SpaceWindow 배열', () => {
    expectTypeOf<Space['windows']>().toEqualTypeOf<SpaceWindow[]>();
  });

  it('PhotoAnalyzeRequest.images는 string 배열', () => {
    expectTypeOf<PhotoAnalyzeRequest['images']>().toEqualTypeOf<string[]>();
  });
});
```
