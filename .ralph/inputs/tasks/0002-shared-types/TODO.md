# 0002 - TypeScript 공유 타입 정의 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. 공통 타입 정의 (`src/types/common.ts`)

- [ ] `Direction` 타입 정의 (8방위: N, NE, E, SE, S, SW, W, NW)
- [ ] `SunlightGrade` 타입 정의 (strong, medium, weak)
- [ ] `WindowSize` 타입 정의 (small, medium, large)
- [ ] `Difficulty` 타입 정의 (easy, medium, hard)
- [ ] `CareType` 타입 정의 (water, repot, fertilize)
- [ ] `Position` 인터페이스 정의 (x, y)
- [ ] `Area` 인터페이스 정의 (x, y, width, height)

## 2. 공간 데이터 모델 (`src/types/space.ts`)

- [ ] `SpaceWindow` 인터페이스 정의
  - id, direction, size, position 필드
  - DOM Window와 충돌 방지 네이밍
- [ ] `SunlightZone` 인터페이스 정의
  - id, grade, area 필드
- [ ] `Space` 인터페이스 정의
  - id, name, address?, dong?, ho?, floorplanImage?, buildingAzimuth?
  - windows: SpaceWindow[], sunlightZones: SunlightZone[]
  - createdAt 필드

## 3. 식물 데이터 모델 (`src/types/plant.ts`)

- [ ] `PlantSpecies` 인터페이스 정의
  - id, name, scientificName, sunlightNeed, difficulty
  - waterIntervalDays, effects, description 필드
- [ ] `Plant` 인터페이스 정의
  - id, speciesId, spaceId, position, registeredAt, lastCaredAt 필드
- [ ] `CareRecord` 인터페이스 정의
  - id, plantId, type, date, note? 필드

## 4. API 요청/응답 타입 (`src/types/api.ts`)

- [ ] `PhotoAnalyzeRequest` 정의 — images: string[] (base64)
- [ ] `PhotoAnalyzeResponse` 정의 — windows[], roomLayout
- [ ] `AddressAnalyzeRequest` 정의 — query, dong?, ho?
- [ ] `AddressAnalyzeResponse` 정의 — candidates[], buildingInfo?
- [ ] `FloorplanAnalyzeRequest` 정의 — address, dong?, ho?
- [ ] `FloorplanAnalyzeResponse` 정의 — floorplanImage?, buildingAzimuth?, windows[], analysisSource
- [ ] `SunlightRequest` 정의 — latitude, longitude, windows
- [ ] `SunlightResponse` 정의 — zones[], overallGrade
- [ ] `PlantRecommendRequest` 정의 — sunlightGrade, beginnerOnly
- [ ] `PlantRecommendResponse` 정의 — plants[] (species, matchScore, reason, suggestedPosition?)

## 5. 외부 API 타입 (`src/types/external.ts`)

- [ ] `BuildingRegisterRequest` 정의
  - serviceKey, sigunguCd, bjdongCd, platGbCd?, bun?, ji?, numOfRows?, pageNo?, _type?
- [ ] `BuildingRegisterResponse` 정의
  - response.header (resultCode, resultMsg)
  - response.body (items, numOfRows, pageNo, totalCount)
- [ ] `BuildingTitleInfo` 정의
  - 주소: platPlc, newPlatPlc, bldNm, dongNm
  - 층수: grndFlrCnt, ugrndFlrCnt, heit
  - 면적: platArea, archArea, totArea
  - 구조: strctCdNm, etcStrct
  - 용도: mainPurpsCdNm, etcPurps
  - 건축연도: useAprDay
  - 세대: hhldCnt, hoCnt

## 6. 인덱스 파일 (`src/types/index.ts`)

- [ ] 모든 타입 파일에서 re-export
- [ ] barrel export 패턴 적용

## 7. 검증

- [ ] `npx tsc --noEmit` 타입 에러 0건
- [ ] 모든 인터페이스에 JSDoc 주석 작성
- [ ] 스펙 §4, §5 인터페이스와 1:1 매핑 확인
