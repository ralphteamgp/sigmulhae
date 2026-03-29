# 0005 - Claude AI 클라이언트 래퍼 TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

### SDK 초기화

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0005-01 | API 키 없음 | ANTHROPIC_API_KEY 미설정 | AIClientError throw | ⬜ |
| T-0005-02 | API 키 있음 | 정상 환경 변수 | Anthropic 인스턴스 생성 | ⬜ |

### JSON 파서

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0005-03 | 코드 블록 JSON | `` ```json\n{"key":"val"}\n``` `` | `{key: "val"}` 파싱 성공 | ⬜ |
| T-0005-04 | 순수 JSON 텍스트 | `{"key":"val"}` | `{key: "val"}` 파싱 성공 | ⬜ |
| T-0005-05 | JSON 앞뒤 텍스트 | `Here is the result: {"key":"val"} Done.` | `{key: "val"}` 추출 성공 | ⬜ |
| T-0005-06 | 유효하지 않은 JSON | `not a json at all` | AIResponseParseError throw | ⬜ |
| T-0005-07 | 빈 응답 | `""` | AIResponseParseError throw | ⬜ |

### 재시도 로직

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0005-08 | 첫 번째 성공 | 성공하는 함수 | 재시도 없이 결과 반환 | ⬜ |
| T-0005-09 | 1회 실패 후 성공 | 1회 실패 → 2회 성공 함수 | 재시도 1회 후 성공 결과 반환 | ⬜ |
| T-0005-10 | 2회 연속 실패 | 항상 실패하는 함수 (maxRetries=1) | 원본 에러 throw | ⬜ |
| T-0005-11 | RateLimit 재시도 | AIRateLimitError 1회 발생 | retryAfter 대기 후 재시도 | ⬜ |
| T-0005-12 | 재시도 불가 에러 | AIClientError 발생 | 즉시 throw (재시도 안 함) | ⬜ |
| T-0005-13 | Overload 재시도 | AIOverloadError 1회 발생 | 3초 대기 후 재시도 | ⬜ |

### 메시지 전송

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0005-14 | sendMessage 정상 | prompt: "Hello" | 텍스트 응답 반환 | ⬜ |
| T-0005-15 | sendMessage 시스템 프롬프트 | systemPrompt 포함 | API 호출에 system 필드 포함 | ⬜ |
| T-0005-16 | sendVisionMessage 단일 이미지 | 이미지 1장 + prompt | 이미지 content 블록 포함 요청 | ⬜ |
| T-0005-17 | sendVisionMessage 다중 이미지 | 이미지 3장 + prompt | 3개 이미지 블록 + 1개 텍스트 블록 | ⬜ |
| T-0005-18 | sendMessageForJSON 정상 | JSON 응답 반환 mock | 파싱된 객체 반환 | ⬜ |
| T-0005-19 | sendMessageForJSON 파싱 실패 | 비-JSON 응답 mock | AIResponseParseError throw | ⬜ |
| T-0005-20 | streamMessage | 스트림 mock | AsyncGenerator로 chunk 수신 | ⬜ |

### 프롬프트 관리

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0005-21 | fillTemplate 치환 | `"Hello {{name}}"`, `{name: "World"}` | `"Hello World"` | ⬜ |
| T-0005-22 | fillTemplate 다중 변수 | `"{{a}} and {{b}}"`, `{a:"X", b:"Y"}` | `"X and Y"` | ⬜ |
| T-0005-23 | fillTemplate 없는 변수 | `"Hello {{name}}"`, `{}` | `"Hello {{name}}"` (치환 안 됨) | ⬜ |
| T-0005-24 | 프롬프트 상수 비어있지 않음 | 8개 프롬프트 상수 확인 | 모두 비어있지 않은 문자열 | ⬜ |
