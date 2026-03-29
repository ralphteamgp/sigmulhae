# 0004 - 식물 시드 데이터 구축

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0004 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §4.2 |
| 의존성 | 0002 (공유 타입) |
| 우선순위 | P1 |
| 상태 | TODO |

---

## 1. 목적

식물 추천 시스템의 기반이 되는 식물 종(Species) 시드 데이터를 `src/data/plants.json`으로 구축한다. 각 식물에 대해 채광 요구량, 난이도, 관수 주기, 효과 등의 정보를 포함한다.

## 2. 범위

### 2.1 포함

- `plants.json` 파일 작성 (최소 20종 이상)
- `PlantSpecies` 타입과 일치하는 스키마
- JSON 스키마 검증 유틸리티
- 채광 등급별 균형 있는 식물 분포

### 2.2 제외

- 식물 이미지 파일 (public/assets/ — 별도 태스크)
- 식물 상세 정보 페이지 UI

## 3. 상세 요구사항

### 3.1 데이터 스키마 (PlantSpecies)

```typescript
interface PlantSpecies {
  id: string;               // 고유 ID (예: "monstera", "pothos" 등 slug 형태)
  name: string;             // 한글 이름 (예: "몬스테라")
  scientificName: string;   // 학명 (예: "Monstera deliciosa")
  sunlightNeed: 'strong' | 'medium' | 'weak';
  difficulty: 'easy' | 'medium' | 'hard';
  waterIntervalDays: number; // 권장 물주기 간격 (일)
  effects: string[];        // 효과 태그 (예: ["공기정화", "인테리어 포인트"])
  description: string;      // 1~2문장 설명
}
```

### 3.2 데이터 분포 요구사항

| 채광 등급 | 최소 식물 수 | 예시 |
|-----------|-------------|------|
| strong (직사광 4h+) | 7종 이상 | 선인장, 다육이, 제라늄 등 |
| medium (간접광 2~4h) | 8종 이상 | 몬스테라, 고무나무, 스킨답서스 등 |
| weak (간접광 2h 미만) | 5종 이상 | 스파티필럼, 산세비에리아 등 |

| 난이도 | 최소 식물 수 |
|--------|-------------|
| easy | 10종 이상 |
| medium | 7종 이상 |
| hard | 3종 이상 |

### 3.3 필수 포함 식물 (인기 실내 식물)

1. 몬스테라 (Monstera deliciosa)
2. 스킨답서스/포토스 (Epipremnum aureum)
3. 산세비에리아/스투키 (Sansevieria)
4. 고무나무 (Ficus elastica)
5. 스파티필럼 (Spathiphyllum)
6. 아레카야자 (Dypsis lutescens)
7. 파키라 (Pachira aquatica)
8. 행운목 (Dracaena fragrans)
9. 선인장류 (Cactaceae)
10. 다육식물류 (Echeveria 등)

### 3.4 효과(effects) 태그 목록

| 태그 | 설명 |
|------|------|
| 공기정화 | NASA 선정 공기정화 식물 등 |
| 가습 | 증산작용으로 습도 향상 |
| 인테리어 포인트 | 시각적 효과가 큰 식물 |
| 초보 추천 | 관리가 매우 쉬운 식물 |
| 반려동물 안전 | 반려동물에게 무독성 |
| 열매 | 열매가 열리는 식물 |
| 향기 | 향이 좋은 식물 |

### 3.5 데이터 검증 함수

`src/lib/db/plant-data.ts`에 시드 데이터 로드 + 검증 함수:

```typescript
// plants.json 로드 및 타입 검증
function loadPlantSpecies(): PlantSpecies[];

// ID로 식물 종 조회
function getPlantSpeciesById(id: string): PlantSpecies | undefined;

// 채광 등급으로 필터
function getPlantsByLightNeed(grade: SunlightGrade): PlantSpecies[];

// 난이도로 필터
function getPlantsByDifficulty(difficulty: Difficulty): PlantSpecies[];
```

## 4. 파일 구조

```
src/
├── data/
│   └── plants.json           # 시드 데이터
└── lib/
    └── db/
        └── plant-data.ts     # 데이터 로드 + 조회 함수
```

## 5. 완료 기준

- [ ] `plants.json`에 20종 이상 식물 데이터
- [ ] 채광 등급별 분포 요구사항 충족
- [ ] 난이도별 분포 요구사항 충족
- [ ] `PlantSpecies` 타입과 100% 일치
- [ ] 조회 함수 단위 테스트 통과
- [ ] 모든 ID 유니크
- [ ] 모든 waterIntervalDays > 0
