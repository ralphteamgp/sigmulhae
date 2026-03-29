# 0010 - 식물 추천 API TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

### 후보 필터링

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0010-01 | strong 환경 필터링 | sunlightGrade: 'strong' | strong+medium 식물 포함, weak 제외 | ⬜ |
| T-0010-02 | medium 환경 필터링 | sunlightGrade: 'medium' | medium+strong+weak 모두 포함 | ⬜ |
| T-0010-03 | weak 환경 필터링 | sunlightGrade: 'weak' | weak+medium 식물 포함, strong 제외 | ⬜ |
| T-0010-04 | 초보자 필터 ON | beginnerOnly: true | difficulty='easy'만 포함 | ⬜ |
| T-0010-05 | 초보자 필터 OFF | beginnerOnly: false | 모든 난이도 포함 | ⬜ |

### 적합도 계산

| # | 시나리오 | 입력 | 기대 matchScore | 상태 |
|---|----------|------|-----------------|------|
| T-0010-06 | 완전 매칭 | strong 환경 + strong 식물 | 1.0 (캡) | ⬜ |
| T-0010-07 | 1단계 차이 | strong 환경 + medium 식물 | 0.6 + 보너스 | ⬜ |
| T-0010-08 | 2단계 차이 | strong 환경 + weak 식물 | 0.2 + 보너스 | ⬜ |
| T-0010-09 | easy 보너스 | difficulty='easy' 식물 | 기본 + 0.05 | ⬜ |
| T-0010-10 | 공기정화 보너스 | effects에 '공기정화' | 기본 + 0.03 | ⬜ |
| T-0010-11 | 초보추천 보너스 | effects에 '초보 추천' | 기본 + 0.02 | ⬜ |
| T-0010-12 | 복합 보너스 | easy + 공기정화 + 초보추천 | 기본 + 0.10 (캡 1.0) | ⬜ |
| T-0010-13 | 최저 점수 필터 | matchScore < 0.2 | 결과에서 제외 | ⬜ |

### 정렬 및 제한

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0010-14 | matchScore 정렬 | 다양한 점수 식물 | 내림차순 정렬 | ⬜ |
| T-0010-15 | 최대 10건 | 15건 매칭 | 상위 10건만 반환 | ⬜ |
| T-0010-16 | 10건 미만 | 5건 매칭 | 5건 전체 반환 | ⬜ |

### AI 추천 텍스트

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0010-17 | reason 생성 | 정상 AI 응답 | 각 식물별 1~2문장 reason | ⬜ |
| T-0010-18 | suggestedPosition 생성 | 정상 AI 응답 | 배치 제안 텍스트 | ⬜ |
| T-0010-19 | AI 실패 graceful | AI 호출 실패 mock | reason: '', suggestedPosition: undefined | ⬜ |

### API Route

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0010-20 | 정상 추천 (strong) | `{ sunlightGrade: 'strong', beginnerOnly: false }` | 200 + plants 배열 | ⬜ |
| T-0010-21 | 정상 추천 (weak + 초보) | `{ sunlightGrade: 'weak', beginnerOnly: true }` | 200 + easy 식물만 | ⬜ |
| T-0010-22 | 잘못된 등급 | `{ sunlightGrade: 'super' }` | 400 + `INVALID_SUNLIGHT_GRADE` | ⬜ |
| T-0010-23 | 매칭 없음 | 극단적 필터 조건 | 404 + `NO_MATCHING_PLANTS` | ⬜ |
| T-0010-24 | 응답 구조 검증 | 정상 요청 | plants[].species, matchScore, reason 존재 | ⬜ |
| T-0010-25 | plants 배열 크기 | 정상 요청 | ≤ 10 | ⬜ |

### 상식 검증 (수동)

| # | 시나리오 | 기대 결과 | 상태 |
|---|----------|-----------|------|
| T-0010-26 | strong 환경 추천 | 선인장, 다육, 제라늄 등 포함 | ⬜ |
| T-0010-27 | weak 환경 추천 | 스파티필럼, 산세비에리아 등 포함 | ⬜ |
| T-0010-28 | 초보자 추천 | 스킨답서스, 산세비에리아 등 easy 식물 | ⬜ |
