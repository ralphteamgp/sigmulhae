# 0010 - 식물 추천 API

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0010 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.1 (POST /api/plants/recommend) |
| 의존성 | 0004 (식물 시드 데이터), 0005 (AI 클라이언트 래퍼), 0009 (채광 계산) |
| 우선순위 | P2 |
| 상태 | TODO |

---

## 1. 목적

채광 등급과 사용자 조건(초보자 필터 등)을 기반으로 적합한 식물을 추천하고, Claude API로 추천 이유와 배치 제안을 생성하는 API Route를 구현한다.

## 2. 범위

### 2.1 포함

- `POST /api/plants/recommend` API Route 구현
- 채광 등급 기반 식물 필터링 (plants.json)
- 초보자 필터링 (difficulty: 'easy')
- 적합도(matchScore) 계산 로직
- Claude API로 추천 이유 + 배치 제안 텍스트 생성
- 결과 정렬 (matchScore 내림차순)

### 2.2 제외

- 식물 검색 UI
- 식물 직접 등록 기능
- 2D 평면도 배치 UI

## 3. 상세 요구사항

### 3.1 API 엔드포인트

**`POST /api/plants/recommend`** (`src/app/api/plants/recommend/route.ts`)

#### Request

```typescript
{
  sunlightGrade: 'strong' | 'medium' | 'weak';
  beginnerOnly: boolean;    // true: difficulty='easy'만
}
```

#### Response (성공)

```typescript
// 200 OK
{
  plants: {
    species: PlantSpecies;
    matchScore: number;          // 적합도 0~1
    reason: string;              // AI 생성 추천 이유 (1~2문장)
    suggestedPosition?: string;  // AI 생성 배치 제안 (예: "거실 창가 왼쪽")
  }[];
}
```

#### Response (에러)

```typescript
// 400 Bad Request
{ error: string; code: 'INVALID_SUNLIGHT_GRADE' }

// 404 Not Found
{ error: string; code: 'NO_MATCHING_PLANTS' }

// 500 Internal Server Error
{ error: string; code: 'AI_SERVICE_ERROR' | 'RECOMMENDATION_ERROR' }
```

### 3.2 추천 알고리즘

#### Step 1: 후보 필터링

```typescript
// 1차: 채광 등급 매칭
// sunlightNeed === sunlightGrade → 완전 매칭
// sunlightNeed가 1단계 차이 → 부분 매칭 (예: medium 환경에서 strong 식물도 가능)

// 2차: 초보자 필터 (beginnerOnly: true)
// difficulty === 'easy'만 포함
```

#### Step 2: 적합도 (matchScore) 계산

```typescript
function calculateMatchScore(
  species: PlantSpecies,
  sunlightGrade: SunlightGrade
): number;
```

| 조건 | 점수 |
|------|------|
| sunlightNeed === sunlightGrade (완전 매칭) | 1.0 |
| sunlightNeed가 1단계 차이 | 0.6 |
| sunlightNeed가 2단계 차이 | 0.2 |

보너스 점수:
- difficulty === 'easy' → +0.05
- effects에 '공기정화' 포함 → +0.03
- effects에 '초보 추천' 포함 → +0.02

최종 점수: min(1.0, 기본점수 + 보너스)

#### Step 3: AI 추천 텍스트 생성

Claude API로 필터링된 식물 목록에 대해 추천 이유와 배치 제안 생성:

- 시스템 프롬프트: `PLANT_RECOMMEND_SYSTEM` (0005)
- 사용자 프롬프트: `PLANT_RECOMMEND_USER` (0005)
  - 입력: 채광 등급, 후보 식물 목록 (이름, 특성), beginnerOnly 여부
  - 출력: 각 식물별 reason(추천 이유 1~2문장), suggestedPosition(배치 제안)

### 3.3 정렬 및 제한

- matchScore 내림차순 정렬
- 최대 10개 식물 반환 (configurable)
- matchScore < 0.2인 식물은 제외

### 3.4 유효성 검증

| 검증 항목 | 조건 | 에러 코드 |
|-----------|------|-----------|
| sunlightGrade | strong/medium/weak 이외 | `INVALID_SUNLIGHT_GRADE` |
| 매칭 결과 없음 | 필터링 후 0건 | `NO_MATCHING_PLANTS` |

## 4. 파일 구조

```
src/app/api/plants/recommend/
└── route.ts                      # POST 핸들러

src/lib/plants/                   # (신규 디렉토리)
├── recommend.ts                  # 추천 알고리즘 (필터, 점수, 정렬)
└── index.ts                      # re-export
```

## 5. 완료 기준

- [ ] POST /api/plants/recommend 정상 동작
- [ ] 채광 등급 기반 식물 필터링 동작
- [ ] 초보자 필터 동작
- [ ] matchScore 계산 정확성
- [ ] Claude API로 추천 이유 + 배치 제안 생성
- [ ] 결과 정렬 (matchScore 내림차순)
- [ ] 최대 10건 제한
- [ ] 유효성 검증 에러 처리
- [ ] 단위 테스트 통과
