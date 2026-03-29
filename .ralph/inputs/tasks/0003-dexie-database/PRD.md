# 0003 - Dexie.js 데이터베이스 레이어

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0003 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §4 |
| 의존성 | 0001 (프로젝트 설정), 0002 (공유 타입) |
| 우선순위 | P0 |
| 상태 | TODO |

---

## 1. 목적

비로그인 서비스인 PlantFit의 클라이언트 데이터 저장소를 구현한다. Dexie.js를 IndexedDB 래퍼로 사용하여 Space, Plant, CareRecord 테이블의 스키마 정의 및 CRUD 헬퍼 함수를 제공한다.

## 2. 범위

### 2.1 포함

- Dexie.js 데이터베이스 인스턴스 생성 (`src/lib/db/index.ts`)
- 테이블 스키마 정의 (Space, Plant, CareRecord)
- 각 테이블별 CRUD 헬퍼 함수
- 스키마 마이그레이션 버전 관리
- UUID 생성 유틸리티

### 2.2 제외

- React Query 연동 (UI 태스크)
- 서버 사이드 DB (없음 — 전체 클라이언트)

## 3. 상세 요구사항

### 3.1 데이터베이스 인스턴스 (`src/lib/db/index.ts`)

```typescript
import Dexie, { type EntityTable } from 'dexie';

const db = new Dexie('plantfit') as Dexie & {
  spaces: EntityTable<Space, 'id'>;
  plants: EntityTable<Plant, 'id'>;
  careRecords: EntityTable<CareRecord, 'id'>;
};

db.version(1).stores({
  spaces: 'id, name, createdAt',
  plants: 'id, speciesId, spaceId, registeredAt',
  careRecords: 'id, plantId, type, date',
});
```

### 3.2 인덱스 설계

| 테이블 | Primary Key | 인덱스 | 용도 |
|--------|-------------|--------|------|
| spaces | id | name, createdAt | 이름 검색, 최신순 정렬 |
| plants | id | speciesId, spaceId, registeredAt | 공간별 식물 조회, 종별 조회 |
| careRecords | id | plantId, type, date | 식물별 기록 조회, 날짜순 정렬 |

### 3.3 CRUD 헬퍼 — Space (`src/lib/db/space.ts`)

| 함수 | 시그니처 | 설명 |
|------|----------|------|
| `createSpace` | `(data: Omit<Space, 'id' \| 'createdAt'>) => Promise<string>` | 공간 생성, UUID 자동 생성, createdAt 자동 설정 |
| `getSpace` | `(id: string) => Promise<Space \| undefined>` | ID로 공간 조회 |
| `getAllSpaces` | `() => Promise<Space[]>` | 전체 공간 목록 (createdAt 내림차순) |
| `updateSpace` | `(id: string, changes: Partial<Space>) => Promise<void>` | 공간 부분 업데이트 |
| `deleteSpace` | `(id: string) => Promise<void>` | 공간 삭제 + 연관 식물/케어기록 cascade 삭제 |

### 3.4 CRUD 헬퍼 — Plant (`src/lib/db/plant.ts`)

| 함수 | 시그니처 | 설명 |
|------|----------|------|
| `createPlant` | `(data: Omit<Plant, 'id' \| 'registeredAt' \| 'lastCaredAt'>) => Promise<string>` | 식물 등록 |
| `getPlant` | `(id: string) => Promise<Plant \| undefined>` | ID로 식물 조회 |
| `getPlantsBySpace` | `(spaceId: string) => Promise<Plant[]>` | 공간별 식물 목록 |
| `updatePlant` | `(id: string, changes: Partial<Plant>) => Promise<void>` | 식물 정보 업데이트 |
| `deletePlant` | `(id: string) => Promise<void>` | 식물 삭제 + 연관 케어기록 cascade 삭제 |

### 3.5 CRUD 헬퍼 — CareRecord (`src/lib/db/care-record.ts`)

| 함수 | 시그니처 | 설명 |
|------|----------|------|
| `createCareRecord` | `(data: Omit<CareRecord, 'id'>) => Promise<string>` | 케어 기록 생성 |
| `getCareRecordsByPlant` | `(plantId: string) => Promise<CareRecord[]>` | 식물별 케어 기록 (date 내림차순) |
| `getLatestCare` | `(plantId: string, type: CareType) => Promise<CareRecord \| undefined>` | 가장 최근 케어 기록 |
| `deleteCareRecord` | `(id: string) => Promise<void>` | 케어 기록 삭제 |

### 3.6 Cascade 삭제 규칙

- **Space 삭제 시**: 해당 spaceId를 가진 Plant 전체 삭제 → 각 Plant의 CareRecord 전체 삭제
- **Plant 삭제 시**: 해당 plantId를 가진 CareRecord 전체 삭제
- Dexie.js는 자동 cascade를 지원하지 않으므로 `db.transaction()`으로 감싸서 원자적 처리

### 3.7 UUID 생성

- `crypto.randomUUID()` 사용 (브라우저 기본 지원)
- 폴백: `Dexie`의 `liveQuery` 등 사용하지 않고 단순 UUID v4

## 4. 파일 구조

```
src/lib/db/
├── index.ts          # Dexie 인스턴스 + 스키마 정의
├── space.ts          # Space CRUD 헬퍼
├── plant.ts          # Plant CRUD 헬퍼
└── care-record.ts    # CareRecord CRUD 헬퍼
```

## 5. 완료 기준

- [ ] Dexie 인스턴스 정상 생성
- [ ] 3개 테이블 스키마 정의
- [ ] Space CRUD 5개 함수 구현
- [ ] Plant CRUD 5개 함수 구현
- [ ] CareRecord CRUD 4개 함수 구현
- [ ] Cascade 삭제 동작
- [ ] 모든 함수 단위 테스트 통과
