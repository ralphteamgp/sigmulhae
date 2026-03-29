# 식물식물해 - Tech Architecture Design

| 항목 | 내용 |
|------|------|
| 문서 버전 | v1.0 |
| 작성일 | 2026-03-29 |
| 기반 문서 | PRD-0001.md v1.4 |
| 상태 | Draft |

---

## 1. 아키텍처 개요

### 1.1 핵심 결정사항

| 결정 | 선택 | 근거 |
|------|------|------|
| 아키텍처 패턴 | Next.js 모놀리스 | MVP 속도, 단일 프로세스, 추후 분리 가능 |
| 프레임워크 | Next.js 15 (App Router) | 서버 컴포넌트, API Route 통합 |
| 언어 | TypeScript 전면 적용 | 타입 안정성 |
| AI 처리 | 외부 API (Claude Vision) | 자체 ML 없이 빠른 MVP |
| 데이터 저장 | 클라이언트 IndexedDB (Dexie.js) | 비로그인 서비스, 서버 DB 불필요 |
| 태양 위치 계산 | suncalc (npm) | 클라이언트 계산 가능, 경량 |
| 배포 | 로컬 개발 환경 우선 | 추후 Vercel 등 배포 고려 |

### 1.2 시스템 구조도

```
┌─────────────────────────────────────────────┐
│              Next.js 15 App Router           │
│                                              │
│  ┌─────────────┐    ┌────────────────────┐   │
│  │  React UI   │    │   API Routes       │   │
│  │  (클라이언트)│───▶│  /api/analyze      │   │
│  │             │    │  /api/plants       │   │
│  │  IndexedDB  │    │  /api/address      │   │
│  │  (Dexie.js) │    │  /api/floorplan    │   │
│  │             │    └────────┬───────────┘   │
│  └─────────────┘             │               │
└──────────────────────────────┼───────────────┘
                               │
              ┌────────────┬───┼────────┬──────────┐
              ▼            ▼   ▼        ▼          ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
       │Claude API│ │건축물대장│ │호갱노노  │ │SunCalc   │
       │(Vision)  │ │공공API   │ │(Playwright│ │(npm 패키지)│
       └──────────┘ └──────────┘ │크롤링)   │ └──────────┘
                                 └──────────┘
```

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 용도 |
|------|------|
| Next.js 15 | App Router, 서버 컴포넌트, API Routes |
| React 19 | UI 컴포넌트 |
| TypeScript | 타입 시스템 |
| Tailwind CSS | 스타일링 |
| Dexie.js | IndexedDB 래퍼 (클라이언트 데이터 저장) |
| Canvas API / Konva.js | 2D 평면도 렌더링 및 인터랙션 |
| suncalc | 태양 위치/고도 계산 |

### 2.2 백엔드 (API Routes)

| 기술 | 용도 |
|------|------|
| Next.js API Routes | 서버 사이드 엔드포인트 |
| Anthropic SDK (@anthropic-ai/sdk) | Claude Vision API 호출 |
| Playwright | 호갱노노 평면도 이미지 크롤링 |
| node-fetch / axios | 건축물대장 공공API 호출 |

### 2.3 개발 도구

| 기술 | 용도 |
|------|------|
| pnpm | 패키지 매니저 |
| ESLint + Prettier | 코드 품질 |
| Vitest | 단위 테스트 |
| Playwright | E2E 테스트 |

---

## 3. 디렉토리 구조

```
plantfit/
├── src/
│   ├── app/                        # App Router
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── page.tsx                # 메인 (온보딩 + 결과)
│   │   ├── analyze/
│   │   │   └── page.tsx            # 공간 분석 (사진/주소 입력)
│   │   ├── result/
│   │   │   └── page.tsx            # 채광 결과 + 2D 평면도
│   │   ├── plants/
│   │   │   └── page.tsx            # 식물 추천 + 배치
│   │   ├── care/
│   │   │   └── page.tsx            # 케어 대시보드 (등록된 식물 관리)
│   │   └── api/
│   │       ├── analyze/
│   │       │   ├── photo/route.ts      # 사진 → Claude Vision 분석
│   │       │   ├── address/route.ts    # 주소 → 건축물대장 조회
│   │       │   └── floorplan/route.ts  # 호갱노노 평면도 Playwright 크롤링
│   │       ├── plants/
│   │       │   └── recommend/route.ts  # 채광 기반 식물 추천
│   │       └── sunlight/
│   │           └── route.ts            # 태양 위치 + 채광 등급 계산
│   ├── components/
│   │   ├── ui/                     # 공통 UI (버튼, 카드, 모달 등)
│   │   ├── onboarding/             # 온보딩 관련
│   │   ├── analyze/                # 사진 업로드, 주소 입력
│   │   ├── floorplan/              # 2D 평면도 + 채광 시각화
│   │   ├── plants/                 # 식물 카드, 추천 리스트
│   │   └── care/                   # 케어 알림, 기록
│   ├── lib/
│   │   ├── ai/                     # Claude API 클라이언트 래퍼
│   │   ├── sunlight/               # suncalc 기반 채광 계산 로직
│   │   ├── crawler/                # Playwright 기반 호갱노노 크롤러
│   │   ├── public-api/             # 건축물대장 공공API 클라이언트
│   │   └── db/                     # Dexie.js 스키마 + CRUD 헬퍼
│   ├── data/
│   │   └── plants.json             # 식물 시드 데이터
│   └── types/                      # 공유 TypeScript 타입 정의
├── public/
│   └── assets/                     # 식물 이미지, 아이콘 등
├── .env.local                      # API 키 (ANTHROPIC_API_KEY 등)
├── package.json
└── tsconfig.json
```

---

## 4. 데이터 모델 (IndexedDB / Dexie.js)

### 4.1 테이블 설계

```typescript
// Space — 분석된 공간 정보
interface Space {
  id: string;               // UUID
  name: string;             // "거실", "침실" 등
  address?: string;         // 주소 (주소 입력 플로우 시)
  dong?: string;            // 동
  ho?: string;              // 호
  floorplanImage?: string;  // 호갱노노 평면도 이미지 (base64)
  buildingAzimuth?: number; // 건물 방위 각도 (0~360, 북=0)
  windows: Window[];        // 창문 정보 배열
  sunlightZones: SunlightZone[]; // 채광 구역
  createdAt: Date;
}

// Window — 창문 정보
interface Window {
  id: string;
  direction: Direction;     // 8방위: N | NE | E | SE | S | SW | W | NW
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number }; // 평면도 내 좌표
}

// SunlightZone — 채광 구역
interface SunlightZone {
  id: string;
  grade: 'strong' | 'medium' | 'weak'; // 강 / 중 / 약
  area: { x: number; y: number; width: number; height: number };
}

// Plant — 등록된 식물
interface Plant {
  id: string;
  speciesId: string;        // plants.json 참조 ID
  spaceId: string;          // 배치된 공간
  position: { x: number; y: number }; // 평면도 내 배치 좌표
  registeredAt: Date;
  lastCaredAt: Date;
}

// CareRecord — 케어 기록
interface CareRecord {
  id: string;
  plantId: string;
  type: 'water' | 'repot' | 'fertilize'; // 물주기 / 분갈이 / 영양제
  date: Date;
  note?: string;
}
```

### 4.2 식물 시드 데이터 (plants.json)

```typescript
interface PlantSpecies {
  id: string;
  name: string;             // "몬스테라"
  scientificName: string;   // "Monstera deliciosa"
  sunlightNeed: 'strong' | 'medium' | 'weak';
  difficulty: 'easy' | 'medium' | 'hard';
  waterIntervalDays: number;
  effects: string[];        // ["공기정화", "인테리어 포인트"]
  description: string;
}
```

---

## 5. API 설계

### 5.1 내부 API Routes

#### POST /api/analyze/photo
사진에서 창문 위치/방향/크기 분석 (Claude Vision)

```typescript
// Request
{
  images: string[];  // base64 인코딩 이미지 (최대 5장)
}

// Response
{
  windows: {
    direction: Direction;        // AI 추정 방향
    size: 'small' | 'medium' | 'large';
    confidence: number;          // 0~1
    position: { x: number; y: number };
  }[];
  roomLayout: {                  // AI 추정 방 구조
    width: number;
    height: number;
  };
}
```

#### POST /api/analyze/address
주소 기반 건축물 정보 조회

```typescript
// Request
{
  query: string;  // 사용자 입력 주소 텍스트
  dong?: string;  // 동
  ho?: string;    // 호수
}

// Response
{
  candidates: {                  // LLM이 정제한 주소 후보 리스트
    address: string;
    jibunAddress?: string;
  }[];
  buildingInfo?: {               // 건축물대장 표제부 조회 결과
    bldNm: string;               // 건물명
    grndFlrCnt: number;          // 지상 층수
    ugrndFlrCnt: number;         // 지하 층수
    totArea: number;             // 연면적 (㎡)
    strctCdNm: string;           // 구조 (예: "철근콘크리트구조")
    mainPurpsCdNm: string;       // 주용도 (예: "공동주택")
    useAprDay: string;           // 사용승인일 (YYYYMMDD)
  };
}
```

#### POST /api/analyze/floorplan
호갱노노에서 평면도 이미지 + 건물 방위 각도 크롤링 + AI 창문 분석

```typescript
// Request
{
  address: string;  // 확정된 주소
  dong?: string;    // 동
  ho?: string;      // 호수
}

// Response
{
  floorplanImage?: string;       // 크롤링한 평면도 이미지 (base64)
  buildingAzimuth?: number;      // 건물 방위 각도 (0~360, 북=0)
  windows: {                     // AI가 평면도+방위각도+건축물대장+건축법령 종합 분석
    direction: Direction;
    size: 'small' | 'medium' | 'large';
    confidence: number;
    position: { x: number; y: number };
  }[];
  analysisSource: 'floorplan' | 'regulation_only'; // 평면도 사용 여부
}
```

#### POST /api/sunlight
채광 등급 계산

```typescript
// Request
{
  latitude: number;
  longitude: number;
  windows: Window[];
}

// Response
{
  zones: SunlightZone[];
  overallGrade: 'strong' | 'medium' | 'weak';
}
```

#### POST /api/plants/recommend
채광 기반 식물 추천

```typescript
// Request
{
  sunlightGrade: 'strong' | 'medium' | 'weak';
  beginnerOnly: boolean;  // 초보자 필터
}

// Response
{
  plants: {
    species: PlantSpecies;
    matchScore: number;          // 적합도 0~1
    reason: string;              // AI 생성 추천 이유
    suggestedPosition?: string;  // "거실 창가 왼쪽"
  }[];
}
```

### 5.2 외부 API

| API | 용도 | 연동 방식 |
|-----|------|-----------|
| Anthropic Claude API | 사진 분석 (Vision), 주소 파싱, 평면도 분석, 추천 텍스트 생성 | api.anthropic.com (SDK) |
| 국토교통부 건축물대장 API | 건물 층수, 면적, 건축연도, 구조 조회 | apis.data.go.kr (REST) |
| 호갱노노 | 아파트 호실별 평면도 이미지 + 건물 방위 각도 | Playwright 크롤링 |

### 5.3 외부 API 상세 스펙

#### Anthropic Claude Messages API (Vision)

- **엔드포인트**: `POST https://api.anthropic.com/v1/messages`
- **SDK**: `@anthropic-ai/sdk`
- **인증**: `ANTHROPIC_API_KEY` (헤더: `x-api-key`)
- **지원 이미지 포맷**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

```typescript
// SDK 사용 예시 (서버 사이드 API Route에서 호출)
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Request — 이미지 + 텍스트를 content 배열로 전송
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',     // 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
          data: '<base64 string>',      // data URI prefix 없이 raw base64
        },
      },
      {
        type: 'text',
        text: '이 방 사진에서 창문을 찾아 위치, 크기, 방향을 JSON으로 분석해주세요',
      },
    ],
  }],
});

// Response
interface ClaudeMessageResponse {
  id: string;                    // "msg_0123abc"
  type: 'message';
  role: 'assistant';
  model: string;
  content: {
    type: 'text';
    text: string;                // AI 응답 텍스트 (JSON 파싱 필요)
  }[];
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

#### 국토교통부 건축물대장 API (표제부)

- **엔드포인트**: `GET https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo`
- **인증**: `serviceKey` 쿼리 파라미터 (data.go.kr 발급)
- **서비스명**: 국토교통부_건축HUB_건축물대장정보 서비스

```typescript
// Request 파라미터
interface BuildingRegisterRequest {
  serviceKey: string;            // 필수: data.go.kr API 인증키
  sigunguCd: string;             // 필수: 시군구코드 (5자리, 예: "11680")
  bjdongCd: string;              // 필수: 법정동코드 (5자리, 예: "10300")
  platGbCd?: '0' | '1' | '2';   // 선택: 대지구분 (0=대지, 1=산, 2=블록)
  bun?: string;                  // 선택: 번 (4자리, 예: "0012")
  ji?: string;                   // 선택: 지 (4자리, 예: "0000")
  numOfRows?: number;            // 선택: 페이지당 건수 (기본: 10)
  pageNo?: number;               // 선택: 페이지 번호 (기본: 1)
  _type?: 'xml' | 'json';       // 선택: 응답 형식 (기본: xml)
}

// Response 구조
interface BuildingRegisterResponse {
  response: {
    header: {
      resultCode: string;        // "00" = 정상
      resultMsg: string;         // "NORMAL SERVICE."
    };
    body: {
      items: {
        item: BuildingTitleInfo | BuildingTitleInfo[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 표제부 응답 — 식물식물해에서 사용하는 주요 필드
interface BuildingTitleInfo {
  // 주소
  platPlc: string;               // 대지위치 (지번 주소)
  newPlatPlc: string;            // 도로명 주소
  bldNm: string;                 // 건물명
  dongNm: string;                // 동 명칭

  // 층수 (식물식물해 핵심)
  grndFlrCnt: number;            // 지상 층수
  ugrndFlrCnt: number;           // 지하 층수
  heit: number;                  // 건물 높이 (m)

  // 면적 (식물식물해 핵심, 단위: ㎡)
  platArea: number;              // 대지면적
  archArea: number;              // 건축면적
  totArea: number;               // 연면적

  // 구조 (식물식물해 핵심)
  strctCdNm: string;             // 구조명 (예: "철근콘크리트구조")
  etcStrct: string;              // 기타 구조

  // 용도
  mainPurpsCdNm: string;         // 주용도 (예: "공동주택", "단독주택")
  etcPurps: string;              // 기타 용도

  // 건축연도 (식물식물해 핵심, YYYYMMDD)
  useAprDay: string;             // 사용승인일

  // 세대/호수
  hhldCnt: number;               // 세대수
  hoCnt: number;                 // 호수
}
```

> **주의**: 주소 → 시군구코드/법정동코드/번/지 변환이 필요하므로, LLM으로 주소를 정제한 후 행정표준코드 매핑 로직이 선행되어야 합니다.

---

## 6. AI 파이프라인

### 6.1 사진 분석 플로우

```
사진 업로드 (1~5장)
    │
    ▼
Claude Vision API 호출
    │  프롬프트: "이 방 사진에서 창문을 찾아 위치, 크기, 예상 방향을 분석해주세요"
    │
    ▼
AI 응답 파싱 (구조화된 JSON)
    │
    ▼
사용자 확인 질문 ("이 창문이 남향 맞나요?")
    │
    ├─ 예 → 결과 확정
    └─ 아니오 → 8방위 직접 선택
```

### 6.2 주소 + 평면도 분석 플로우

```
사용자 주소 텍스트 입력
    │
    ▼
Claude API로 주소 정제 → 후보 리스트 생성
    │
    ▼
사용자 주소 선택 + 동·호수 입력
    │
    ▼
┌──────────────────┬──────────────────────┐
│                  │                      │
▼                  ▼                      │
건축물대장 API     호갱노노 Playwright     │  (병렬 호출)
조회               크롤링 (평면도+방위각도) │
│                  │                      │
├─ 성공            ├─ 성공 → 평면도+방위각 │
└─ 실패 → 수동입력 └─ 실패 → 건축법령만   │
│                  │                      │
└──────────────────┘                      │
    │
    ▼
Claude Vision API로 종합 분석
    │  입력: 평면도 이미지 + 건물 방위 각도 + 건축물대장 정보 + 건축법령 규정
    │
    ▼
창문 위치·크기·방향 도출
```

### 6.3 채광 분석 플로우

```
창문 정보 (방향, 크기) + 위치 좌표
    │
    ▼
suncalc로 태양 궤적 계산
    │  - 시간대별 태양 고도/방위각
    │  - 직달일사 시간 산출
    │
    ▼
채광 등급 산출
    │  강: 직달일사 4시간 이상
    │  중: 직달일사 2~4시간
    │  약: 직달일사 2시간 미만
    │
    ▼
공간 내 채광 구역 매핑 (2D 좌표)
```

---

## 7. 페이지 흐름 및 상태 관리

### 7.1 페이지 라우팅

```
/ (메인)
├── 첫 방문: 온보딩 화면
└── 분석 완료: 결과 요약 대시보드

/analyze
├── 분석 방법 선택 (사진 / 주소)
├── 사진 업로드 플로우
└── 주소 입력 플로우

/result
├── 방별 채광 등급
└── 2D 평면도 + 채광 구역 시각화

/plants
├── 식물 추천 리스트
├── 식물 검색/직접 등록
└── 2D 평면도 배치

/care
├── 등록 식물 목록 + 상태
├── 케어 알림 (의인화 메시지)
└── 케어 기록 탭 (물주기/분갈이/영양제)
```

### 7.2 클라이언트 상태 관리

- **서버 상태 (API 호출)**: React Query (TanStack Query) — AI 분석 결과 캐싱, 로딩/에러 상태
- **UI 상태**: React useState/useReducer — 모달, 폼 입력 등
- **영속 데이터**: Dexie.js (IndexedDB) — 공간, 식물, 케어 기록
- **전역 상태 관리 라이브러리 불필요** — 페이지 간 데이터는 IndexedDB에서 직접 조회

---

## 8. 에러 처리 전략

PRD 섹션 4의 에러 시나리오에 대응하는 처리 방식:

| 에러 상황 | 처리 방식 | 구현 위치 |
|-----------|-----------|-----------|
| 건축물대장 API 실패 | 안내 메시지 + 수동 입력 폼 폴백 | /api/analyze/address |
| 호갱노노 평면도 크롤링 실패 | 안내 메시지 + 건축물대장+건축법령 기준으로만 분석 | /api/analyze/floorplan |
| 사진 창문 인식 실패 | 안내 메시지 + 8방위 직접 입력 유도 | /api/analyze/photo |
| AI 응답 지연/실패 | 1회 재시도 → 실패 시 안내 + 재시작 유도 | lib/ai/ 공통 래퍼 |
| 창문 크기 분석 실패 | 보정계수 1.0 기본값 + 결과에 미반영 안내 | lib/sunlight/ |
| 식물 DB 검색 없음 | "직접 등록할까요?" + 등록 폼 | /plants 페이지 |

---

## 9. 비기능 요건 대응

### 9.1 성능

| PRD 목표 | 대응 방안 |
|----------|-----------|
| 채광 분석 30초 이내 | Claude API 스트리밍 응답 + 로딩 UX |
| 건축물대장 API 3초 | 타임아웃 설정 3초 → 초과 시 로딩 인디케이터 |
| 사진 업로드 장당 5초 | 클라이언트 리사이즈 (max 1920px) 후 전송 |
| 페이지 LCP 3초 | 서버 컴포넌트 활용, 이미지 lazy loading |

### 9.2 보안/개인정보

- HTTPS (로컬: 자체 인증서 또는 localhost 허용)
- API 키는 `.env.local`에 보관, 클라이언트 노출 없음 (API Route에서만 사용)
- 사진 데이터는 AI 분석 후 서버 메모리에서 즉시 삭제 (디스크 미저장)
- 개인정보처리방침 고지 페이지 필요 (위치정보보호법)

### 9.3 접근성

- 시맨틱 HTML + ARIA 라벨
- 키보드 탐색 가능 (주요 버튼, 입력 필드)
- 이미지 alt 텍스트
- 채광 등급: 색상 + 텍스트 병행 (색각 이상 대응)

---

## 10. 주요 npm 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 15.x | 프레임워크 |
| react | 19.x | UI |
| typescript | 5.x | 타입 시스템 |
| tailwindcss | 4.x | 스타일링 |
| dexie | 4.x | IndexedDB 래퍼 |
| @anthropic-ai/sdk | latest | Claude API |
| suncalc | 1.x | 태양 위치 계산 |
| konva + react-konva | latest | 2D 평면도 캔버스 |
| @tanstack/react-query | 5.x | 서버 상태 관리 |
| vitest | latest | 단위 테스트 |
| playwright | latest | 호갱노노 크롤링 + E2E 테스트 |

---

*식물식물해 Tech Architecture v1.0 | 2026-03-29*
