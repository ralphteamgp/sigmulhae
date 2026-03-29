# 0008 - 평면도 크롤링 API

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0008 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.1 (POST /api/analyze/floorplan), §6.2 |
| 의존성 | 0005 (AI 클라이언트 래퍼), 0007 (주소 분석 API) |
| 우선순위 | P1 |
| 상태 | TODO |

---

## 1. 목적

확정된 주소를 기반으로 호갱노노에서 아파트 평면도 이미지와 건물 방위 각도를 Playwright로 크롤링하고, Claude Vision API로 평면도를 종합 분석하여 창문 위치/크기/방향을 도출하는 API Route를 구현한다.

## 2. 범위

### 2.1 포함

- `POST /api/analyze/floorplan` API Route 구현
- Playwright 기반 호갱노노 크롤러 (`src/lib/crawler/`)
- 평면도 이미지 + 건물 방위 각도 추출
- Claude Vision API로 종합 분석 (평면도 + 방위각 + 건축물대장 + 건축법령)
- 크롤링 실패 시 건축법령만으로 분석하는 폴백

### 2.2 제외

- 호갱노노 외 다른 사이트 크롤링
- 사용자 직접 평면도 업로드 (별도 기능)
- 평면도 시각화 UI

## 3. 상세 요구사항

### 3.1 API 엔드포인트

**`POST /api/analyze/floorplan`** (`src/app/api/analyze/floorplan/route.ts`)

#### Request

```typescript
{
  address: string;    // 확정된 주소
  dong?: string;      // 동
  ho?: string;        // 호수
}
```

#### Response (성공)

```typescript
// 200 OK
{
  floorplanImage?: string;       // 크롤링한 평면도 이미지 (base64)
  buildingAzimuth?: number;      // 건물 방위 각도 (0~360, 북=0)
  windows: {
    direction: Direction;
    size: 'small' | 'medium' | 'large';
    confidence: number;          // 0~1
    position: { x: number; y: number };
  }[];
  analysisSource: 'floorplan' | 'regulation_only';
}
```

#### Response (에러)

```typescript
// 400 Bad Request — 주소 없음
{ error: string; code: 'EMPTY_ADDRESS' }

// 500 Internal Server Error
{ error: string; code: 'CRAWLING_ERROR' | 'AI_SERVICE_ERROR' }
```

### 3.2 호갱노노 크롤러 (`src/lib/crawler/hogangnono.ts`)

#### 크롤링 대상

| 데이터 | 추출 방식 | 필수 |
|--------|-----------|------|
| 평면도 이미지 | 호실 상세 페이지의 평면도 이미지 URL → base64 변환 | 선택 |
| 건물 방위 각도 | 단지 배치도의 나침반/방위 표시에서 추출 | 선택 |

#### 크롤링 플로우

```
1. Playwright 브라우저 실행 (headless: true)
2. 호갱노노 검색 → 주소로 아파트 검색
3. 검색 결과에서 해당 아파트 선택
4. 단지 상세 페이지 이동
5. 동·호수 매핑 → 호실 평면도 페이지
6. 평면도 이미지 다운로드 (base64)
7. 단지 배치도에서 건물 방위 각도 추출
8. 브라우저 종료
```

#### 크롤러 함수

```typescript
interface CrawlResult {
  floorplanImage?: string;    // base64 (크롤링 성공 시)
  buildingAzimuth?: number;   // 0~360 (추출 성공 시)
  success: boolean;
  error?: string;
}

async function crawlFloorplan(
  address: string,
  dong?: string,
  ho?: string
): Promise<CrawlResult>;
```

#### 크롤러 설정

- headless 모드
- 타임아웃: 페이지 로드 30초, 전체 크롤링 60초
- User-Agent: 일반적인 Chrome UA
- 요청 간 지연: 1~2초 (서버 부하 배려)
- 이미지 외 리소스(CSS, 폰트 등) 차단으로 속도 최적화

### 3.3 AI 종합 분석

크롤링 결과에 따라 두 가지 분석 경로:

#### 경로 A: 평면도 있음 (`analysisSource: 'floorplan'`)

Claude Vision API에 아래 정보를 모두 제공하여 창문 분석:
- 평면도 이미지
- 건물 방위 각도 (있을 경우)
- 건축물대장 정보 (0007에서 이미 조회된 경우, 클라이언트가 전달 가능)
- 건축법령 기준 (시스템 프롬프트에 포함)

#### 경로 B: 평면도 없음 (`analysisSource: 'regulation_only'`)

크롤링 실패 시, 건축물대장 정보 + 건축법령 규정만으로 창문 추정:
- 건물 구조, 층수, 용도 등 기반
- 일반적인 아파트 창문 배치 패턴 적용
- confidence 낮게 설정 (0.3 이하)

### 3.4 AI 분석 프롬프트

**시스템 프롬프트** (0005 `FLOORPLAN_ANALYSIS_SYSTEM`):
- 역할: 건축 평면도 분석 전문가
- 입력: 평면도 이미지, 건물 방위, 건축물대장 정보
- 출력: 창문 위치/크기/방향 JSON
- 건축법령 참조:
  - 건축법 시행령 제53조 (채광을 위한 창문)
  - 주택건설기준 등에 관한 규정 제39조 (채광)
  - 건축물의 피난·방화구조 등의 기준에 관한 규칙

### 3.5 에러 핸들링

| 상황 | 처리 |
|------|------|
| 크롤링 완전 실패 (사이트 접근 불가) | 경로 B (regulation_only)로 폴백 |
| 평면도 이미지 없음 | 경로 B (regulation_only)로 폴백 |
| 방위 각도만 실패 | 방위 없이 경로 A 진행 |
| AI 분석 실패 | 1회 재시도 → 500 반환 |

## 4. 파일 구조

```
src/
├── app/api/analyze/floorplan/
│   └── route.ts                  # POST 핸들러
└── lib/crawler/
    ├── hogangnono.ts             # 호갱노노 크롤러
    └── browser.ts                # Playwright 브라우저 관리 (시작/종료)
```

## 5. 완료 기준

- [ ] POST /api/analyze/floorplan 정상 동작
- [ ] Playwright 크롤러 호갱노노 평면도 추출 성공
- [ ] 건물 방위 각도 추출 성공
- [ ] Claude Vision으로 평면도 기반 창문 분석 성공
- [ ] 크롤링 실패 시 regulation_only 폴백 동작
- [ ] analysisSource 필드 정확한 구분
- [ ] 단위 테스트 통과
