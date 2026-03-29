# 0003 - Dexie.js 데이터베이스 레이어 TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

### Space CRUD

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0003-01 | Space 생성 | `{ name: '거실', windows: [], sunlightZones: [] }` | UUID 반환, createdAt 자동 설정 | ⬜ |
| T-0003-02 | Space 조회 | 존재하는 ID | Space 객체 반환 | ⬜ |
| T-0003-03 | Space 조회 (없는 ID) | 존재하지 않는 ID | undefined 반환 | ⬜ |
| T-0003-04 | Space 전체 목록 | 3개 Space 생성 후 조회 | 3건 반환, createdAt 내림차순 | ⬜ |
| T-0003-05 | Space 수정 | `{ name: '침실' }` | name 변경, 나머지 필드 유지 | ⬜ |
| T-0003-06 | Space 수정 (없는 ID) | 존재하지 않는 ID | 에러 throw | ⬜ |
| T-0003-07 | Space 삭제 | 식물 2개 + 케어기록 3개 있는 Space | Space, 식물 2개, 케어기록 3개 모두 삭제 | ⬜ |
| T-0003-08 | Space 삭제 (연관 없음) | 식물 0개인 Space | Space만 삭제 | ⬜ |

### Plant CRUD

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0003-09 | Plant 생성 | `{ speciesId: 'sp1', spaceId: 'space1', position: {x:0,y:0} }` | UUID 반환, registeredAt/lastCaredAt 자동 설정 | ⬜ |
| T-0003-10 | Plant 조회 | 존재하는 ID | Plant 객체 반환 | ⬜ |
| T-0003-11 | 공간별 Plant 조회 | spaceId='space1' (2개), 'space2' (1개) | space1: 2건, space2: 1건 | ⬜ |
| T-0003-12 | Plant 수정 | `{ position: {x:10, y:20} }` | position 변경 | ⬜ |
| T-0003-13 | Plant 삭제 | 케어기록 3개 있는 Plant | Plant + 케어기록 3개 모두 삭제 | ⬜ |

### CareRecord CRUD

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0003-14 | CareRecord 생성 | `{ plantId: 'p1', type: 'water', date: new Date() }` | UUID 반환 | ⬜ |
| T-0003-15 | CareRecord 생성 → Plant.lastCaredAt 업데이트 | 위와 동일 | Plant.lastCaredAt가 기록 날짜로 업데이트 | ⬜ |
| T-0003-16 | 식물별 기록 조회 | plantId='p1' (5건) | 5건, date 내림차순 | ⬜ |
| T-0003-17 | 최근 케어 조회 | plantId='p1', type='water' | 가장 최근 물주기 기록 1건 | ⬜ |
| T-0003-18 | 최근 케어 조회 (없음) | plantId='p1', type='fertilize' (기록 없음) | undefined 반환 | ⬜ |
| T-0003-19 | CareRecord 삭제 | 특정 기록 ID | 해당 기록만 삭제, 다른 기록 유지 | ⬜ |

### 트랜잭션 / 엣지 케이스

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0003-20 | Cascade 삭제 원자성 | Space 삭제 중 에러 발생 시뮬레이션 | 전체 롤백 (아무것도 삭제 안 됨) | ⬜ |
| T-0003-21 | 동시 생성 | 동일 Space에 Plant 3개 동시 생성 | 3개 모두 정상 생성 | ⬜ |
| T-0003-22 | UUID 유니크 | 100건 생성 후 ID 중복 확인 | 중복 없음 | ⬜ |
