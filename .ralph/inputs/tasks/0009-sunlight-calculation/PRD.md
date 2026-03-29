# 0009 - 채광 계산 엔진

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0009 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.1 (POST /api/sunlight), §6.3 |
| 의존성 | 0002 (공유 타입) |
| 우선순위 | P1 |
| 상태 | TODO |

---

## 1. 목적

창문 정보(방향, 크기)와 위치 좌표를 입력받아 suncalc 라이브러리로 태양 궤적을 계산하고, 직달일사 시간 기반으로 채광 등급(강/중/약)을 산출한 후, 공간 내 채광 구역을 매핑하는 엔진을 구현한다.

## 2. 범위

### 2.1 포함

- `POST /api/sunlight` API Route 구현
- suncalc 기반 태양 위치/고도 계산 라이브러리 (`src/lib/sunlight/`)
- 창문별 직달일사 시간 계산
- 채광 등급 산출 로직 (강/중/약)
- 공간 내 채광 구역(SunlightZone) 매핑

### 2.2 제외

- 2D 평면도 채광 시각화 (UI 태스크)
- 계절/날짜 선택 UI

## 3. 상세 요구사항

### 3.1 API 엔드포인트

**`POST /api/sunlight`** (`src/app/api/sunlight/route.ts`)

#### Request

```typescript
{
  latitude: number;          // 위도 (예: 37.4979)
  longitude: number;         // 경도 (예: 127.0276)
  windows: SpaceWindow[];    // 창문 정보 배열
}
```

#### Response

```typescript
// 200 OK
{
  zones: SunlightZone[];     // 채광 구역 배열
  overallGrade: 'strong' | 'medium' | 'weak';  // 전체 채광 등급
}
```

#### Response (에러)

```typescript
// 400 Bad Request
{ error: string; code: 'INVALID_COORDINATES' | 'NO_WINDOWS' | 'INVALID_WINDOW_DATA' }

// 500 Internal Server Error
{ error: string; code: 'CALCULATION_ERROR' }
```

### 3.2 태양 위치 계산 (`src/lib/sunlight/solar.ts`)

suncalc 라이브러리를 활용한 핵심 계산:

```typescript
import SunCalc from 'suncalc';

// 특정 시각의 태양 위치
interface SolarPosition {
  azimuth: number;     // 태양 방위각 (라디안, 남=0, 서=양수)
  altitude: number;    // 태양 고도 (라디안)
}

// 하루 중 시간대별 태양 위치 계산
function getDailySolarPositions(
  lat: number,
  lng: number,
  date: Date,
  intervalMinutes?: number   // 기본: 30분
): { time: Date; position: SolarPosition }[];

// 일출/일몰 시각
function getSunTimes(
  lat: number,
  lng: number,
  date: Date
): { sunrise: Date; sunset: Date; solarNoon: Date };
```

### 3.3 직달일사 시간 계산 (`src/lib/sunlight/direct-sunlight.ts`)

각 창문에 대해 하루 중 직달일사가 들어오는 시간을 계산:

```typescript
// 창문 방향과 태양 방위각의 관계로 일사 여부 판단
function calculateDirectSunlightHours(
  window: SpaceWindow,
  solarPositions: { time: Date; position: SolarPosition }[]
): number;  // 직달일사 시간 (hours)
```

**계산 로직:**
1. 창문 방향(8방위) → 방위각 범위 매핑
   - N: 337.5~22.5° (≈0°)
   - NE: 22.5~67.5° (≈45°)
   - E: 67.5~112.5° (≈90°)
   - SE: 112.5~157.5° (≈135°)
   - S: 157.5~202.5° (≈180°)
   - SW: 202.5~247.5° (≈225°)
   - W: 247.5~292.5° (≈270°)
   - NW: 292.5~337.5° (≈315°)
2. 태양 방위각이 창문 방위각 범위 내 + 태양 고도 > 0 → 직달일사
3. 창문 크기별 보정계수 적용
   - large: 1.0
   - medium: 0.7
   - small: 0.4
4. 30분 단위 합산 → 총 직달일사 시간

### 3.4 채광 등급 산출 (`src/lib/sunlight/grade.ts`)

스펙 §6.3 기준:

| 등급 | 조건 | 설명 |
|------|------|------|
| strong (강) | 직달일사 ≥ 4시간 | 직사광이 충분 |
| medium (중) | 2시간 ≤ 직달일사 < 4시간 | 간접광 중심 |
| weak (약) | 직달일사 < 2시간 | 간접광 부족 |

```typescript
function calculateSunlightGrade(
  directSunlightHours: number
): SunlightGrade;
```

**전체 등급(overallGrade)** 산출:
- 모든 창문의 직달일사 시간 중 최대값 기준
- 또는 가중 평균 (창문 크기 가중치)

### 3.5 채광 구역 매핑 (`src/lib/sunlight/zone-mapper.ts`)

창문 위치와 채광 등급을 기반으로 공간 내 채광 구역 생성:

```typescript
function mapSunlightZones(
  windows: SpaceWindow[],
  grades: Map<string, SunlightGrade>  // windowId → grade
): SunlightZone[];
```

**매핑 로직:**
1. 각 창문 주변에 채광 구역 생성
2. 창문 크기에 비례하여 구역 크기 결정
   - large: 반경 3m (정규화 좌표)
   - medium: 반경 2m
   - small: 반경 1m
3. 창문에서 멀어질수록 등급 하락 (강→중→약)
4. 구역 겹침 처리: 높은 등급 우선

### 3.6 기준 날짜

- 기본: **춘분 (3월 20일경)** — 평균적인 일조 조건
- 향후: 사용자가 날짜 선택 가능 (현재 스코프 외)

### 3.7 유효성 검증

| 검증 항목 | 조건 | 에러 코드 |
|-----------|------|-----------|
| 좌표 범위 | -90 ≤ lat ≤ 90, -180 ≤ lng ≤ 180 | `INVALID_COORDINATES` |
| 창문 없음 | windows 배열 비어있음 | `NO_WINDOWS` |
| 창문 데이터 | direction 유효, size 유효 | `INVALID_WINDOW_DATA` |

## 4. 파일 구조

```
src/
├── app/api/sunlight/
│   └── route.ts                  # POST 핸들러
└── lib/sunlight/
    ├── index.ts                  # public API re-export
    ├── solar.ts                  # suncalc 기반 태양 위치 계산
    ├── direct-sunlight.ts        # 직달일사 시간 계산
    ├── grade.ts                  # 채광 등급 산출
    └── zone-mapper.ts            # 채광 구역 매핑
```

## 5. 완료 기준

- [ ] POST /api/sunlight 정상 동작
- [ ] suncalc 기반 태양 위치 계산 정확성
- [ ] 직달일사 시간 계산 (8방위 × 3크기)
- [ ] 채광 등급 산출 (강/중/약 분류)
- [ ] 채광 구역 매핑 동작
- [ ] overallGrade 산출
- [ ] 유효성 검증 3가지 에러 처리
- [ ] 단위 테스트 통과
