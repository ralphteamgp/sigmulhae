# 0010 - 식물 추천 API TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. 추천 알고리즘 (`src/lib/plants/recommend.ts`)

### 1.1 후보 필터링
- [ ] `filterPlantCandidates()` 함수 구현
  - 1차: sunlightNeed 매칭 (완전 + 1단계 차이)
    - strong 환경: strong(완전) + medium(부분)
    - medium 환경: medium(완전) + strong(부분) + weak(부분)
    - weak 환경: weak(완전) + medium(부분)
  - 2차: beginnerOnly=true 시 difficulty='easy'만
- [ ] 2단계 차이 식물도 포함하되 낮은 점수 부여

### 1.2 적합도 계산
- [ ] `calculateMatchScore()` 함수 구현
  - 기본 점수: 완전 매칭 1.0 / 1단계 0.6 / 2단계 0.2
  - 보너스: easy +0.05, 공기정화 +0.03, 초보 추천 +0.02
  - 최종: min(1.0, 기본 + 보너스)
- [ ] matchScore < 0.2 필터 제거

### 1.3 정렬 및 제한
- [ ] matchScore 내림차순 정렬
- [ ] 상위 10건만 반환

## 2. AI 추천 텍스트 생성

- [ ] Claude API 호출 (`sendMessageForJSON`)
  - 시스템 프롬프트: `PLANT_RECOMMEND_SYSTEM`
  - 사용자 프롬프트: `PLANT_RECOMMEND_USER`
    - 채광 등급, 후보 식물 목록 (name, sunlightNeed, difficulty, effects)
    - beginnerOnly 여부
  - 응답: 각 식물별 `{ id, reason, suggestedPosition }`
- [ ] AI 응답을 식물 목록에 매핑 (id 기준)
- [ ] AI 호출 실패 시 → reason, suggestedPosition 없이 반환 (graceful degradation)

## 3. 인덱스 파일 (`src/lib/plants/index.ts`)

- [ ] `filterPlantCandidates`, `calculateMatchScore` re-export

## 4. API Route 구현 (`src/app/api/plants/recommend/route.ts`)

### 4.1 유효성 검증
- [ ] sunlightGrade 유효값 확인 (strong/medium/weak) → `INVALID_SUNLIGHT_GRADE`
- [ ] beginnerOnly 기본값 false

### 4.2 추천 파이프라인
- [ ] `loadPlantSpecies()` (0004)로 시드 데이터 로드
- [ ] `filterPlantCandidates()` 호출
- [ ] 결과 0건 → 404 + `NO_MATCHING_PLANTS`
- [ ] 각 후보에 `calculateMatchScore()` 적용
- [ ] matchScore < 0.2 제거
- [ ] 정렬 + 상위 10건 제한
- [ ] Claude API로 추천 텍스트 생성
- [ ] 최종 응답 조립 (species + matchScore + reason + suggestedPosition)

### 4.3 에러 핸들링
- [ ] AI 실패 → reason/suggestedPosition 빈 문자열로 대체 (200 반환)
- [ ] 예기치 않은 에러 → 500 + `RECOMMENDATION_ERROR`

## 5. 단위 테스트

- [ ] `src/lib/plants/__tests__/recommend.test.ts`
  - strong 환경 → strong/medium 식물 필터링 확인
  - medium 환경 → medium/strong/weak 필터링 확인
  - weak 환경 → weak/medium 필터링 확인
  - beginnerOnly=true → easy만 포함
  - matchScore 완전 매칭 = 1.0 확인
  - matchScore 1단계 차이 = 0.6 확인
  - matchScore 보너스 계산 확인
  - 정렬 순서 확인 (내림차순)
  - 10건 제한 확인
  - matchScore < 0.2 제외 확인
- [ ] `src/app/api/plants/recommend/__tests__/route.test.ts`
  - 정상 요청 (strong + beginnerOnly=false) → 200 + plants 배열
  - 정상 요청 (weak + beginnerOnly=true) → 200 + easy 식물만
  - 잘못된 sunlightGrade → 400 + INVALID_SUNLIGHT_GRADE
  - 매칭 없음 → 404 + NO_MATCHING_PLANTS
  - AI 실패 → 200 + reason 빈 문자열 (graceful)
  - plants 배열 matchScore 내림차순 확인
  - plants 배열 최대 10건 확인

## 6. 검증

- [ ] `pnpm test` — plants recommend 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
- [ ] strong 환경 추천 결과에 선인장/다육 포함 확인 (상식 검증)
- [ ] weak 환경 추천 결과에 스파티필럼/산세비에리아 포함 확인
