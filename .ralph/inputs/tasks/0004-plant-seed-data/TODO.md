# 0004 - 식물 시드 데이터 구축 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. 식물 데이터 조사 및 작성

- [ ] 강광(strong) 식물 7종 이상 데이터 작성
  - 선인장, 다육이(에케베리아), 제라늄, 로즈마리, 라벤더, 올리브, 레몬나무 등
- [ ] 중광(medium) 식물 8종 이상 데이터 작성
  - 몬스테라, 고무나무, 파키라, 아레카야자, 행운목, 떡갈잎고무나무, 필로덴드론, 칼라테아 등
- [ ] 약광(weak) 식물 5종 이상 데이터 작성
  - 스킨답서스, 스파티필럼, 산세비에리아, 아글라오네마, 관음죽 등
- [ ] 각 식물별 정확한 학명 확인
- [ ] 각 식물별 적정 물주기 간격(일) 조사
- [ ] 각 식물별 난이도 분류 (easy/medium/hard)
- [ ] 각 식물별 effects 태그 할당
- [ ] 각 식물별 1~2문장 description 작성

## 2. plants.json 파일 생성 (`src/data/plants.json`)

- [ ] JSON 배열 형태로 전체 식물 데이터 작성
- [ ] 각 항목이 `PlantSpecies` 인터페이스와 일치하는지 확인
- [ ] ID는 slug 형태 (예: `monstera-deliciosa`, `pothos`)
- [ ] JSON 포맷 검증 (유효한 JSON)

## 3. 데이터 로드/조회 함수 (`src/lib/db/plant-data.ts`)

- [ ] `loadPlantSpecies()` — plants.json import 및 반환
- [ ] `getPlantSpeciesById(id)` — ID로 단건 조회
- [ ] `getPlantsByLightNeed(grade)` — 채광 등급별 필터
- [ ] `getPlantsByDifficulty(difficulty)` — 난이도별 필터

## 4. 단위 테스트 (`src/lib/db/__tests__/plant-data.test.ts`)

- [ ] plants.json 로드 시 20종 이상 확인
- [ ] 모든 ID 유니크 확인
- [ ] 모든 필수 필드 존재 확인 (null/undefined 없음)
- [ ] waterIntervalDays > 0 확인
- [ ] sunlightNeed 값이 유효한지 확인 (strong/medium/weak)
- [ ] difficulty 값이 유효한지 확인 (easy/medium/hard)
- [ ] 채광 등급별 최소 수량 확인 (strong: 7+, medium: 8+, weak: 5+)
- [ ] 난이도별 최소 수량 확인 (easy: 10+, medium: 7+, hard: 3+)
- [ ] `getPlantSpeciesById()` 존재/미존재 케이스 테스트
- [ ] `getPlantsByLightNeed()` 필터 정확성 테스트
- [ ] `getPlantsByDifficulty()` 필터 정확성 테스트

## 5. 검증

- [ ] `pnpm test` — plant-data 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
