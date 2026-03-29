# 0006 - 사진 분석 API TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. API Route 기본 구조 (`src/app/api/analyze/photo/route.ts`)

- [ ] `POST` 핸들러 함수 export
- [ ] `NextRequest` body 파싱 (JSON)
- [ ] 에러 응답 표준 구조 정의 (`{ error, code, suggestion? }`)

## 2. 유효성 검증

- [ ] images 배열 존재 및 비어있지 않음 확인 → `NO_IMAGES`
- [ ] images 배열 길이 ≤ 5 확인 → `TOO_MANY_IMAGES`
- [ ] 각 이미지의 base64 데이터에서 미디어 타입 추출/검증
  - jpeg, png, gif, webp만 허용 → `INVALID_IMAGE_FORMAT`
- [ ] 각 이미지의 base64 디코딩 크기 ≤ 10MB 확인 → `IMAGE_TOO_LARGE`
  - base64 문자열 길이 × 0.75 ≈ 바이트 크기로 추정

## 3. Claude Vision API 호출

- [ ] AI 클라이언트 래퍼의 `sendVisionMessageForJSON` 사용
- [ ] 각 이미지를 Vision content 블록으로 변환
  - `{ data: base64, mediaType: 'image/jpeg' | ... }`
- [ ] 시스템 프롬프트: `PHOTO_ANALYSIS_SYSTEM` 사용
- [ ] 사용자 프롬프트: `PHOTO_ANALYSIS_USER` + 이미지 장수 정보
- [ ] API 호출 (재시도 로직은 AI 래퍼에서 처리)

## 4. AI 응답 후처리

- [ ] JSON 파싱된 응답 구조 검증
  - windows 배열 존재
  - 각 window의 direction: 8방위 유효값
  - 각 window의 size: small/medium/large
  - 각 window의 confidence: 0~1 범위
  - 각 window의 position: x, y 0~1 범위
  - roomLayout: width, height 양수
- [ ] 유효하지 않은 값 보정/필터링
  - confidence 범위 초과 시 clamp
  - position 범위 초과 시 clamp
- [ ] 창문 0개 감지 시 422 응답
  - `{ error: '사진에서 창문을 인식하지 못했습니다', code: 'NO_WINDOWS_DETECTED', suggestion: 'manual_input' }`

## 5. 에러 핸들링

- [ ] AI API 호출 실패 (AIRequestError 등) → 500 응답
  - `{ error: 'AI 분석 서비스 오류가 발생했습니다', code: 'AI_SERVICE_ERROR' }`
- [ ] JSON 파싱 실패 (AIResponseParseError) → 500 응답
- [ ] 예기치 않은 에러 → 500 + 일반 에러 메시지

## 6. 보안 (스펙 §9.2)

- [ ] 이미지 데이터 디스크 미저장 확인
  - API Route에서 메모리 내에서만 처리
- [ ] 응답 후 이미지 변수 참조 해제 (GC 유도)

## 7. 단위 테스트 (`src/app/api/analyze/photo/__tests__/route.test.ts`)

- [ ] 정상 요청 → 200 + windows 배열 반환
- [ ] 이미지 없음 → 400 + NO_IMAGES
- [ ] 이미지 6장 → 400 + TOO_MANY_IMAGES
- [ ] 잘못된 이미지 포맷 → 400 + INVALID_IMAGE_FORMAT
- [ ] 이미지 크기 초과 → 400 + IMAGE_TOO_LARGE
- [ ] AI 창문 미인식 → 422 + NO_WINDOWS_DETECTED
- [ ] AI API 실패 → 500 + AI_SERVICE_ERROR
- [ ] AI 클라이언트 mock으로 테스트 (실제 API 호출 안 함)

## 8. 검증

- [ ] `pnpm test` — photo API 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
- [ ] `curl` 또는 Postman으로 수동 테스트 (선택)
