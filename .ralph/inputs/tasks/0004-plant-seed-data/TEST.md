# 0004 - 식물 시드 데이터 구축 TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

### 데이터 무결성

| # | 시나리오 | 검증 방법 | 기대 결과 | 상태 |
|---|----------|-----------|-----------|------|
| T-0004-01 | 최소 데이터 수량 | `loadPlantSpecies().length` | 20 이상 | ⬜ |
| T-0004-02 | ID 유니크 | Set 크기 === 배열 길이 비교 | 중복 없음 | ⬜ |
| T-0004-03 | 필수 필드 존재 | 모든 항목의 필수 필드 null/undefined 체크 | 모두 존재 | ⬜ |
| T-0004-04 | waterIntervalDays 양수 | 모든 항목 > 0 확인 | 모두 양수 | ⬜ |
| T-0004-05 | sunlightNeed 유효값 | 'strong' \| 'medium' \| 'weak' 체크 | 모두 유효 | ⬜ |
| T-0004-06 | difficulty 유효값 | 'easy' \| 'medium' \| 'hard' 체크 | 모두 유효 | ⬜ |
| T-0004-07 | effects 배열 비어있지 않음 | 모든 항목 effects.length > 0 | 1개 이상 | ⬜ |
| T-0004-08 | description 비어있지 않음 | 모든 항목 description.trim().length > 0 | 비어있지 않음 | ⬜ |

### 분포 요구사항

| # | 시나리오 | 검증 방법 | 기대 결과 | 상태 |
|---|----------|-----------|-----------|------|
| T-0004-09 | strong 식물 수 | `getPlantsByLightNeed('strong').length` | 7 이상 | ⬜ |
| T-0004-10 | medium 식물 수 | `getPlantsByLightNeed('medium').length` | 8 이상 | ⬜ |
| T-0004-11 | weak 식물 수 | `getPlantsByLightNeed('weak').length` | 5 이상 | ⬜ |
| T-0004-12 | easy 난이도 수 | `getPlantsByDifficulty('easy').length` | 10 이상 | ⬜ |
| T-0004-13 | medium 난이도 수 | `getPlantsByDifficulty('medium').length` | 7 이상 | ⬜ |
| T-0004-14 | hard 난이도 수 | `getPlantsByDifficulty('hard').length` | 3 이상 | ⬜ |

### 조회 함수

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0004-15 | ID 조회 (존재) | `getPlantSpeciesById('monstera-deliciosa')` | 몬스테라 데이터 반환 | ⬜ |
| T-0004-16 | ID 조회 (없음) | `getPlantSpeciesById('nonexistent')` | undefined 반환 | ⬜ |
| T-0004-17 | 채광 필터 정확성 | `getPlantsByLightNeed('strong')` | 모든 결과 sunlightNeed === 'strong' | ⬜ |
| T-0004-18 | 난이도 필터 정확성 | `getPlantsByDifficulty('easy')` | 모든 결과 difficulty === 'easy' | ⬜ |
