# 0007 - 주소 분석 API

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0007 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.1 (POST /api/analyze/address), §5.2, §5.3 |
| 의존성 | 0005 (AI 클라이언트 래퍼) |
| 우선순위 | P1 |
| 상태 | TODO |

---

## 1. 목적

사용자가 입력한 주소 텍스트를 Claude API로 정제하고, 정제된 주소로 국토교통부 건축물대장 공공API를 조회하여 건물 정보를 반환하는 API Route를 구현한다.

## 2. 범위

### 2.1 포함

- `POST /api/analyze/address` API Route 구현
- Claude API로 주소 텍스트 정제 → 후보 리스트 생성
- 주소 → 행정코드 변환 (시군구코드, 법정동코드, 번, 지)
- 건축물대장 공공API 호출 (`getBrTitleInfo`)
- 에러 핸들링 (스펙 §8: API 실패 → 수동 입력 폴백)

### 2.2 제외

- 주소 선택 UI
- 동·호수 입력 UI
- 호갱노노 크롤링 (0008에서 처리)

## 3. 상세 요구사항

### 3.1 API 엔드포인트

**`POST /api/analyze/address`** (`src/app/api/analyze/address/route.ts`)

#### Request

```typescript
{
  query: string;   // 사용자 입력 주소 텍스트 (예: "강남구 역삼동 센트럴푸르지오")
  dong?: string;   // 동 (선택)
  ho?: string;     // 호수 (선택)
}
```

#### Response (성공)

```typescript
// 200 OK
{
  candidates: {
    address: string;          // 도로명 주소
    jibunAddress?: string;    // 지번 주소
  }[];
  buildingInfo?: {
    bldNm: string;            // 건물명
    grndFlrCnt: number;       // 지상 층수
    ugrndFlrCnt: number;      // 지하 층수
    totArea: number;          // 연면적 (㎡)
    strctCdNm: string;        // 구조
    mainPurpsCdNm: string;    // 주용도
    useAprDay: string;        // 사용승인일
  };
}
```

#### Response (에러)

```typescript
// 400 Bad Request — 주소 텍스트 없음
{ error: string; code: 'EMPTY_QUERY' }

// 404 Not Found — 주소 후보 없음
{ error: string; code: 'NO_ADDRESS_FOUND' }

// 502 Bad Gateway — 건축물대장 API 실패
{ error: string; code: 'BUILDING_API_ERROR'; fallback: 'manual_input' }

// 500 Internal Server Error — AI 서비스 오류
{ error: string; code: 'AI_SERVICE_ERROR' }
```

### 3.2 주소 정제 파이프라인

```
사용자 텍스트 ("강남구 역삼동 센트럴푸르지오")
    │
    ▼
Claude API로 주소 정제
    │  - 시/도, 구/군, 동/읍/면 추출
    │  - 건물명, 아파트명 추출
    │  - 도로명/지번 후보 생성
    │  - 시군구코드(5자리), 법정동코드(5자리) 매핑
    │  - 번(4자리), 지(4자리) 추출
    │
    ▼
후보 리스트 반환 (최대 5건)
```

### 3.3 건축물대장 API 클라이언트 (`src/lib/public-api/building-register.ts`)

| 함수 | 시그니처 | 설명 |
|------|----------|------|
| `fetchBuildingInfo` | `(params: BuildingRegisterRequest) => Promise<BuildingTitleInfo[]>` | 표제부 조회 |
| `parseAddressToCode` | `(address: ParsedAddress) => AddressCode` | 주소 → 행정코드 변환 |

```typescript
interface ParsedAddress {
  sido: string;
  sigungu: string;
  bjdong: string;
  bun?: string;
  ji?: string;
}

interface AddressCode {
  sigunguCd: string;    // 5자리
  bjdongCd: string;     // 5자리
  bun?: string;         // 4자리 (좌측 0 패딩)
  ji?: string;          // 4자리 (좌측 0 패딩)
}
```

### 3.4 행정코드 매핑

- Claude API 프롬프트에 행정코드 매핑을 포함하여 AI가 직접 코드를 반환하도록 설계
- 또는 별도 행정코드 매핑 JSON 파일 (`src/data/address-codes.json`) 사용
- 시군구코드: 전국 시군구 약 250개 → JSON 파일로 관리
- 법정동코드: 전국 법정동 약 5,000개 → JSON 파일 크기 고려하여 AI 매핑 우선

### 3.5 건축물대장 API 호출 상세

- **엔드포인트**: `GET https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo`
- **인증**: `BUILDING_REGISTER_API_KEY` (`.env.local`)
- **응답 형식**: JSON (`_type=json`)
- **타임아웃**: 3초 (스펙 §9.1)
- **에러 시**: 502 + `BUILDING_API_ERROR` + `fallback: 'manual_input'`

### 3.6 AI 주소 파싱 프롬프트

**시스템 프롬프트** (0005 `ADDRESS_PARSE_SYSTEM`):
- 역할: 한국 주소 체계 전문가
- 출력: 정제된 주소 후보 + 행정코드 (JSON)
- 주소 체계: 도로명, 지번, 시군구코드, 법정동코드

**사용자 프롬프트** (0005 `ADDRESS_PARSE_USER`):
- 사용자 입력 텍스트 포함
- 최대 5건 후보 요청
- 행정코드 정확성 강조

## 4. 파일 구조

```
src/
├── app/api/analyze/address/
│   └── route.ts                      # POST 핸들러
├── lib/public-api/
│   ├── building-register.ts          # 건축물대장 API 클라이언트
│   └── address-code.ts               # 주소 → 행정코드 변환 유틸
└── data/
    └── address-codes.json            # 시군구+법정동 코드 매핑 (선택)
```

## 5. 완료 기준

- [ ] POST /api/analyze/address 정상 동작
- [ ] Claude API로 주소 정제 → 후보 리스트 반환
- [ ] 행정코드 매핑 정확성
- [ ] 건축물대장 API 호출 성공
- [ ] 건축물대장 API 실패 시 502 + fallback 안내
- [ ] 타임아웃 3초 설정
- [ ] 단위 테스트 통과
