# 0005 - Claude AI 클라이언트 래퍼 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. SDK 초기화 (`src/lib/ai/client.ts`)

- [ ] Anthropic SDK import 및 싱글톤 인스턴스 생성
- [ ] 환경 변수 `ANTHROPIC_API_KEY` 검증
  - 미설정 시 `AIClientError` throw + 명확한 에러 메시지
- [ ] 모델/토큰 기본값 상수 정의
  - `DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'`
  - `DEFAULT_MAX_TOKENS = 4096`
- [ ] 클라이언트 인스턴스 export

## 2. 에러 클래스 정의 (`src/lib/ai/errors.ts`)

- [ ] `AIClientError` — SDK 초기화 실패, API 키 없음
- [ ] `AIRequestError` — API 호출 실패 (네트워크, 타임아웃)
  - `statusCode`, `originalError` 필드 포함
- [ ] `AIRateLimitError` extends `AIRequestError` — 429 에러
  - `retryAfter` 필드 포함
- [ ] `AIResponseParseError` — JSON 파싱 실패
  - `rawResponse` 필드 포함
- [ ] `AIOverloadError` extends `AIRequestError` — 529 에러

## 3. 재시도 로직 (`src/lib/ai/retry.ts`)

- [ ] `withRetry<T>()` 제네릭 래퍼 함수 구현
  - maxRetries: 기본 1
  - retryDelayMs: 기본 1000ms
  - retryOn: 에러 필터 콜백 (기본: AIRequestError, AIRateLimitError, AIOverloadError)
- [ ] RateLimit 시 `retryAfter` 헤더 기반 대기
- [ ] Overload 시 3초 대기 후 재시도
- [ ] 최종 실패 시 원본 에러 throw

## 4. JSON 파서 (`src/lib/ai/json-parser.ts`)

- [ ] `extractJSON<T>(text: string): T` 함수 구현
  - 코드 블록 (```json ... ```) 내부 JSON 추출
  - 코드 블록 없을 경우 전체 텍스트 `JSON.parse` 시도
  - 실패 시 `AIResponseParseError` throw
- [ ] 응답 텍스트 전처리 (앞뒤 공백, BOM 제거)

## 5. 메시지 전송 함수 (`src/lib/ai/message.ts`)

- [ ] `sendMessage(options)` 구현
  - `anthropic.messages.create()` 호출
  - `withRetry` 래핑
  - 텍스트 응답 추출 (`response.content[0].text`)
- [ ] `sendVisionMessage(options)` 구현
  - 이미지 content 블록 + 텍스트 content 블록 조합
  - 다중 이미지 지원
  - base64 데이터 유효성 기본 검증
- [ ] `sendMessageForJSON<T>(options)` 구현
  - `sendMessage` + `extractJSON` 조합
- [ ] `sendVisionMessageForJSON<T>(options)` 구현
  - `sendVisionMessage` + `extractJSON` 조합
- [ ] `streamMessage(options)` AsyncGenerator 구현
  - `anthropic.messages.stream()` 사용
  - 텍스트 delta chunk yield
- [ ] `streamVisionMessage(options)` AsyncGenerator 구현

## 6. 프롬프트 관리 (`src/lib/ai/prompts.ts`)

- [ ] `PHOTO_ANALYSIS_SYSTEM` — 사진에서 창문 분석 시스템 프롬프트
- [ ] `PHOTO_ANALYSIS_USER` — 사진 분석 사용자 프롬프트 템플릿
- [ ] `ADDRESS_PARSE_SYSTEM` — 주소 텍스트 정제 시스템 프롬프트
- [ ] `ADDRESS_PARSE_USER` — 주소 파싱 사용자 프롬프트 템플릿
- [ ] `FLOORPLAN_ANALYSIS_SYSTEM` — 평면도+방위+건축정보 종합 분석 시스템 프롬프트
- [ ] `FLOORPLAN_ANALYSIS_USER` — 평면도 분석 사용자 프롬프트 템플릿
- [ ] `PLANT_RECOMMEND_SYSTEM` — 식물 추천 시스템 프롬프트
- [ ] `PLANT_RECOMMEND_USER` — 식물 추천 사용자 프롬프트 템플릿
- [ ] `fillTemplate(template, vars)` — `{{variable}}` 치환 헬퍼 함수

## 7. 인덱스 파일 (`src/lib/ai/index.ts`)

- [ ] 모든 public 함수/클래스 re-export
  - sendMessage, sendVisionMessage, sendMessageForJSON, sendVisionMessageForJSON
  - streamMessage, streamVisionMessage
  - 에러 클래스들
  - 프롬프트 상수들, fillTemplate

## 8. 단위 테스트

- [ ] `src/lib/ai/__tests__/client.test.ts`
  - API 키 없을 때 AIClientError throw 확인
- [ ] `src/lib/ai/__tests__/json-parser.test.ts`
  - 코드 블록 JSON 추출, 순수 JSON 파싱, 파싱 실패 에러
- [ ] `src/lib/ai/__tests__/retry.test.ts`
  - 성공 시 재시도 안 함, 1회 실패 후 성공, 2회 연속 실패 시 throw
  - RateLimit 에러 시 재시도, 필터 조건 미충족 시 즉시 throw
- [ ] `src/lib/ai/__tests__/message.test.ts`
  - Anthropic SDK mock으로 sendMessage 정상 응답 확인
  - sendVisionMessage 이미지 포함 요청 구조 확인
  - sendMessageForJSON JSON 파싱 확인
- [ ] `src/lib/ai/__tests__/prompts.test.ts`
  - fillTemplate 치환 동작 확인
  - 모든 프롬프트 상수 비어있지 않음 확인

## 9. 검증

- [ ] `pnpm test` — AI 클라이언트 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
- [ ] 클라이언트 번들에 서버 코드 미포함 확인
