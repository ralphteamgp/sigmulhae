# 0003 - Dexie.js 데이터베이스 레이어 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. Dexie 인스턴스 설정 (`src/lib/db/index.ts`)

- [ ] Dexie 인스턴스 생성 (DB명: `plantfit`)
- [ ] TypeScript 타입 바인딩 (`EntityTable` 사용)
- [ ] version(1) 스키마 정의
  - `spaces`: `id, name, createdAt`
  - `plants`: `id, speciesId, spaceId, registeredAt`
  - `careRecords`: `id, plantId, type, date`
- [ ] DB 인스턴스 export

## 2. Space CRUD (`src/lib/db/space.ts`)

- [ ] `createSpace()` 구현
  - UUID 자동 생성 (`crypto.randomUUID()`)
  - `createdAt` 자동 설정 (`new Date()`)
  - `windows`, `sunlightZones` 기본값 빈 배열
  - 생성된 ID 반환
- [ ] `getSpace()` 구현
  - `db.spaces.get(id)` 래핑
- [ ] `getAllSpaces()` 구현
  - `createdAt` 내림차순 정렬 (`.reverse().sortBy('createdAt')`)
- [ ] `updateSpace()` 구현
  - `db.spaces.update(id, changes)` 래핑
  - 존재하지 않는 ID 시 에러 throw
- [ ] `deleteSpace()` 구현
  - `db.transaction('rw', [db.spaces, db.plants, db.careRecords])` 사용
  - Space 삭제 → 연관 Plant 조회 → 각 Plant의 CareRecord 삭제 → Plant 삭제 → Space 삭제

## 3. Plant CRUD (`src/lib/db/plant.ts`)

- [ ] `createPlant()` 구현
  - UUID 자동 생성
  - `registeredAt`, `lastCaredAt` 자동 설정
  - 생성된 ID 반환
- [ ] `getPlant()` 구현
- [ ] `getPlantsBySpace()` 구현
  - `db.plants.where('spaceId').equals(spaceId).toArray()`
- [ ] `updatePlant()` 구현
  - 존재하지 않는 ID 시 에러 throw
- [ ] `deletePlant()` 구현
  - `db.transaction('rw', [db.plants, db.careRecords])` 사용
  - 연관 CareRecord 삭제 → Plant 삭제

## 4. CareRecord CRUD (`src/lib/db/care-record.ts`)

- [ ] `createCareRecord()` 구현
  - UUID 자동 생성
  - 생성된 ID 반환
  - 연관 Plant의 `lastCaredAt` 업데이트
- [ ] `getCareRecordsByPlant()` 구현
  - `date` 내림차순 정렬
- [ ] `getLatestCare()` 구현
  - plantId + type 조건으로 가장 최근 1건
- [ ] `deleteCareRecord()` 구현

## 5. 단위 테스트 작성

- [ ] Space CRUD 테스트 (`src/lib/db/__tests__/space.test.ts`)
  - 생성, 조회, 전체 목록, 수정, 삭제 테스트
  - cascade 삭제 테스트 (Space → Plant → CareRecord)
- [ ] Plant CRUD 테스트 (`src/lib/db/__tests__/plant.test.ts`)
  - 생성, 조회, 공간별 조회, 수정, 삭제 테스트
  - cascade 삭제 테스트 (Plant → CareRecord)
- [ ] CareRecord CRUD 테스트 (`src/lib/db/__tests__/care-record.test.ts`)
  - 생성, 식물별 조회, 최근 기록 조회, 삭제 테스트
  - 생성 시 Plant.lastCaredAt 업데이트 확인
- [ ] Dexie fake-indexeddb 또는 메모리 DB로 테스트 환경 구성

## 6. 검증

- [ ] `pnpm test` — DB 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
