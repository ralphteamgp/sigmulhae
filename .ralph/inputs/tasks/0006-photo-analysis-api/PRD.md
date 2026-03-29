# 0006 - 사진 분석 API

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0006 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.1 (POST /api/analyze/photo), §6.1 |
| 의존성 | 0005 (AI 클라이언트 래퍼) |
| 우선순위 | P1 |
| 상태 | TODO |

---

## 1. 목적

사용자가 업로드한 방 사진(1~5장)을 Claude Vision API로 분석하여 창문의 위치, 크기, 예상 방향을 추출하는 API Route를 구현한다.

## 2. 범위

### 2.1 포함

- `POST /api/analyze/photo` API Route 구현
- 이미지 유효성 검증 (포맷, 크기, 장수)
- Claude Vision API 호출 (사진 분석 프롬프트)
- AI 응답 파싱 → 구조화된 창문 정보
- 에러 핸들링 (스펙 §8: 사진 창문 인식 실패 → 안내 메시지)

### 2.2 제외

- 클라이언트 사이드 이미지 리사이즈 (UI 태스크)
- 사용자 확인 질문 UI ("이 창문이 남향 맞나요?")
- 8방위 직접 선택 UI

## 3. 상세 요구사항

### 3.1 API 엔드포인트

**`POST /api/analyze/photo`** (`src/app/api/analyze/photo/route.ts`)

#### Request

```typescript
// Content-Type: application/json
{
  images: string[];  // base64 인코딩 이미지 (최대 5장)
}
```

#### Response (성공)

```typescript
// 200 OK
{
  windows: {
    direction: Direction;        // AI 추정 방향 (8방위)
    size: 'small' | 'medium' | 'large';
    confidence: number;          // 0~1
    position: { x: number; y: number }; // 정규화 좌표 (0~1)
  }[];
  roomLayout: {
    width: number;               // AI 추정 방 너비 (상대값)
    height: number;              // AI 추정 방 높이 (상대값)
  };
}
```

#### Response (에러)

```typescript
// 400 Bad Request — 유효성 검증 실패
{ error: string; code: 'INVALID_IMAGE_FORMAT' | 'TOO_MANY_IMAGES' | 'IMAGE_TOO_LARGE' | 'NO_IMAGES' }

// 422 Unprocessable Entity — AI가 창문을 인식하지 못함
{ error: string; code: 'NO_WINDOWS_DETECTED'; suggestion: 'manual_input' }

// 500 Internal Server Error — AI API 호출 실패
{ error: string; code: 'AI_SERVICE_ERROR' }
```

### 3.2 이미지 유효성 검증

| 검증 항목 | 조건 | 에러 코드 |
|-----------|------|-----------|
| 이미지 없음 | images 배열 비어있음 | `NO_IMAGES` |
| 이미지 장수 | 최대 5장 | `TOO_MANY_IMAGES` |
| 이미지 포맷 | jpeg, png, gif, webp만 허용 | `INVALID_IMAGE_FORMAT` |
| 이미지 크기 | base64 디코딩 기준 장당 10MB 이하 | `IMAGE_TOO_LARGE` |

### 3.3 AI 분석 프롬프트 설계

**시스템 프롬프트** (0005 `PHOTO_ANALYSIS_SYSTEM`):
- 역할: 실내 공간 사진 분석 전문가
- 출력 형식: JSON 구조 명시
- 창문 인식 기준: 유리 면, 프레임, 빛의 방향, 커튼/블라인드

**사용자 프롬프트** (0005 `PHOTO_ANALYSIS_USER`):
- 각 사진의 창문 위치, 크기(small/medium/large), 예상 방향(8방위) 분석 요청
- 창문이 없는 경우 빈 배열 반환 명시
- confidence(0~1) 포함 요청

### 3.4 AI 응답 후처리

- JSON 파싱 (`sendVisionMessageForJSON` 사용)
- direction 값 유효성 검증 (8방위)
- confidence 범위 검증 (0~1)
- position 범위 검증 (0~1)
- 창문 0개 시 → 422 응답 + `NO_WINDOWS_DETECTED`

### 3.5 성능 요구사항 (스펙 §9.1)

- 사진 업로드 장당 5초 이내 처리 목표
- 서버 사이드에서 base64 이미지를 메모리에만 보관, 디스크 미저장 (§9.2)
- 분석 완료 후 이미지 데이터 메모리 해제

## 4. 파일 구조

```
src/app/api/analyze/photo/
└── route.ts          # POST 핸들러
```

## 5. 완료 기준

- [ ] POST /api/analyze/photo 정상 동작
- [ ] 유효성 검증 4가지 에러 케이스 처리
- [ ] Claude Vision API 호출 성공
- [ ] AI 응답 → PhotoAnalyzeResponse 파싱 성공
- [ ] 창문 미인식 시 422 + manual_input 안내
- [ ] AI 실패 시 1회 재시도 후 500 반환
- [ ] 단위 테스트 통과
