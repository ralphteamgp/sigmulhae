# 0002 - TypeScript 공유 타입 정의

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0002 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §4, §5 |
| 의존성 | 0001 (프로젝트 설정) |
| 우선순위 | P0 |
| 상태 | TODO |

---

## 1. 목적

프로젝트 전체에서 공유하는 TypeScript 인터페이스와 타입을 `src/types/` 디렉토리에 정의한다. 데이터 모델(§4)과 API 요청/응답(§5) 타입을 모두 포함하여, 프론트엔드-백엔드 간 타입 안정성을 보장한다.

## 2. 범위

### 2.1 포함

- IndexedDB 데이터 모델 타입 (Space, Window, SunlightZone, Plant, CareRecord)
- 식물 시드 데이터 타입 (PlantSpecies)
- API 요청/응답 타입 (5개 엔드포인트 전체)
- 외부 API 응답 타입 (건축물대장 API)
- 공통 Enum/Union 타입 (Direction, SunlightGrade 등)

### 2.2 제외

- UI 컴포넌트 Props 타입 (각 컴포넌트에서 정의)
- React Query 관련 타입

## 3. 상세 요구사항

### 3.1 파일 구조

```
src/types/
├── index.ts           # 모든 타입 re-export
├── space.ts           # Space, Window, SunlightZone
├── plant.ts           # Plant, CareRecord, PlantSpecies
├── api.ts             # API 요청/응답 타입
├── external.ts        # 건축물대장 API 응답 타입
└── common.ts          # Direction, SunlightGrade 등 공통 타입
```

### 3.2 공통 타입 (`common.ts`)

```typescript
// 8방위
type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

// 채광 등급
type SunlightGrade = 'strong' | 'medium' | 'weak';

// 창문 크기
type WindowSize = 'small' | 'medium' | 'large';

// 난이도
type Difficulty = 'easy' | 'medium' | 'hard';

// 케어 타입
type CareType = 'water' | 'repot' | 'fertilize';

// 2D 좌표
interface Position {
  x: number;
  y: number;
}

// 2D 영역
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### 3.3 데이터 모델 타입 (`space.ts`, `plant.ts`)

스펙 §4.1의 인터페이스를 그대로 구현:
- `Space` — 분석된 공간 정보
- `Window` (이름 충돌 방지 위해 `SpaceWindow`로 네이밍) — 창문 정보
- `SunlightZone` — 채광 구역
- `Plant` — 등록된 식물
- `CareRecord` — 케어 기록
- `PlantSpecies` — 식물 시드 데이터 (§4.2)

### 3.4 API 타입 (`api.ts`)

스펙 §5.1의 모든 엔드포인트 Request/Response 타입:

| 엔드포인트 | Request 타입 | Response 타입 |
|-----------|-------------|--------------|
| POST /api/analyze/photo | `PhotoAnalyzeRequest` | `PhotoAnalyzeResponse` |
| POST /api/analyze/address | `AddressAnalyzeRequest` | `AddressAnalyzeResponse` |
| POST /api/analyze/floorplan | `FloorplanAnalyzeRequest` | `FloorplanAnalyzeResponse` |
| POST /api/sunlight | `SunlightRequest` | `SunlightResponse` |
| POST /api/plants/recommend | `PlantRecommendRequest` | `PlantRecommendResponse` |

### 3.5 외부 API 타입 (`external.ts`)

- `BuildingRegisterRequest` — 건축물대장 API 요청 파라미터
- `BuildingRegisterResponse` — 건축물대장 API 응답 구조
- `BuildingTitleInfo` — 표제부 응답 주요 필드

### 3.6 네이밍 규칙

- 인터페이스명: PascalCase
- 타입 별칭: PascalCase
- 프로퍼티명: camelCase
- `Window` → `SpaceWindow`로 변경 (DOM Window 객체와 충돌 방지)
- API 타입은 `{EndpointName}Request`, `{EndpointName}Response` 패턴

## 4. 완료 기준

- [ ] `src/types/` 하위 6개 파일 존재
- [ ] `index.ts`에서 모든 타입 re-export
- [ ] `npx tsc --noEmit` 타입 에러 0건
- [ ] 스펙 §4, §5의 모든 인터페이스 커버
- [ ] JSDoc 주석으로 각 필드 설명 포함
