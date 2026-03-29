# 0005 - Claude AI 클라이언트 래퍼

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0005 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §5.3, §6, §8 |
| 의존성 | 0001 (프로젝트 설정), 0002 (공유 타입) |
| 우선순위 | P0 |
| 상태 | TODO |

---

## 1. 목적

Claude API 호출을 위한 공통 래퍼를 `src/lib/ai/`에 구현한다. 사진 분석, 주소 파싱, 평면도 분석, 추천 텍스트 생성 등 다양한 용도로 재사용되며, 에러 처리, 재시도, 응답 파싱, 스트리밍 등 공통 기능을 제공한다.

## 2. 범위

### 2.1 포함

- Anthropic SDK 초기화 및 설정
- 텍스트 메시지 전송 함수
- Vision (이미지 포함) 메시지 전송 함수
- 구조화된 JSON 응답 파싱
- 에러 처리 및 1회 재시도 로직 (스펙 §8)
- 스트리밍 응답 지원 (스펙 §9.1)
- 프롬프트 템플릿 관리

### 2.2 제외

- 개별 API Route 구현 (0006~0010에서 처리)
- UI 레벨 로딩/에러 상태 관리

## 3. 상세 요구사항

### 3.1 SDK 초기화 (`src/lib/ai/client.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';

// 싱글톤 클라이언트 (서버 사이드 전용)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

- 환경 변수 `ANTHROPIC_API_KEY` 미설정 시 명확한 에러 메시지
- 서버 사이드(API Route)에서만 사용 — 클라이언트 번들에 포함되지 않도록 주의

### 3.2 핵심 함수

#### `sendMessage` — 텍스트 전용 메시지

```typescript
interface SendMessageOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;        // 기본: 'claude-sonnet-4-5-20250929'
  maxTokens?: number;    // 기본: 4096
}

async function sendMessage(options: SendMessageOptions): Promise<string>;
```

#### `sendVisionMessage` — 이미지 포함 메시지

```typescript
interface SendVisionMessageOptions {
  images: Array<{
    data: string;           // base64 문자열
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  }>;
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

async function sendVisionMessage(options: SendVisionMessageOptions): Promise<string>;
```

#### `sendMessageForJSON` — JSON 응답 파싱 포함

```typescript
async function sendMessageForJSON<T>(options: SendMessageOptions): Promise<T>;
async function sendVisionMessageForJSON<T>(options: SendVisionMessageOptions): Promise<T>;
```

- 응답 텍스트에서 JSON 추출 (코드 블록 래핑 대응)
- `JSON.parse` 실패 시 `AIResponseParseError` throw

#### `streamMessage` — 스트리밍 응답

```typescript
async function* streamMessage(options: SendMessageOptions): AsyncGenerator<string>;
async function* streamVisionMessage(options: SendVisionMessageOptions): AsyncGenerator<string>;
```

- Server-Sent Events 형태로 API Route에서 스트리밍 가능

### 3.3 에러 처리 (`src/lib/ai/errors.ts`)

| 에러 클래스 | 상황 | 처리 |
|------------|------|------|
| `AIClientError` | SDK 초기화 실패, API 키 없음 | 즉시 throw, 재시도 안 함 |
| `AIRequestError` | API 호출 실패 (네트워크, 타임아웃) | 1회 재시도 후 throw |
| `AIRateLimitError` | 429 Too Many Requests | 재시도 (exponential backoff 1회) |
| `AIResponseParseError` | JSON 파싱 실패 | 1회 재시도 (다른 프롬프트 없이) 후 throw |
| `AIOverloadError` | 529 Overloaded | 3초 대기 후 1회 재시도 |

스펙 §8 정책: **1회 재시도 → 실패 시 에러 throw** (호출하는 API Route에서 사용자에게 안내)

### 3.4 재시도 로직 (`src/lib/ai/retry.ts`)

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;     // 기본: 1
    retryDelayMs?: number;   // 기본: 1000
    retryOn?: (error: Error) => boolean;
  }
): Promise<T>;
```

### 3.5 프롬프트 관리 (`src/lib/ai/prompts.ts`)

각 용도별 시스템 프롬프트 및 사용자 프롬프트 템플릿:

| 프롬프트 키 | 용도 | 사용처 |
|------------|------|--------|
| `PHOTO_ANALYSIS_SYSTEM` | 사진 분석 시스템 프롬프트 | 0006 |
| `PHOTO_ANALYSIS_USER` | 사진 분석 사용자 프롬프트 템플릿 | 0006 |
| `ADDRESS_PARSE_SYSTEM` | 주소 정제 시스템 프롬프트 | 0007 |
| `ADDRESS_PARSE_USER` | 주소 정제 사용자 프롬프트 템플릿 | 0007 |
| `FLOORPLAN_ANALYSIS_SYSTEM` | 평면도 분석 시스템 프롬프트 | 0008 |
| `FLOORPLAN_ANALYSIS_USER` | 평면도 분석 사용자 프롬프트 템플릿 | 0008 |
| `PLANT_RECOMMEND_SYSTEM` | 식물 추천 시스템 프롬프트 | 0010 |
| `PLANT_RECOMMEND_USER` | 식물 추천 사용자 프롬프트 템플릿 | 0010 |

프롬프트 템플릿은 변수를 `{{variable}}` 형태로 받아 치환하는 헬퍼 함수 제공.

### 3.6 모델 설정

```typescript
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_MAX_TOKENS = 4096;
```

## 4. 파일 구조

```
src/lib/ai/
├── index.ts          # public API re-export
├── client.ts         # Anthropic SDK 초기화 + 싱글톤
├── message.ts        # sendMessage, sendVisionMessage, streamMessage
├── json-parser.ts    # JSON 응답 추출/파싱
├── errors.ts         # 커스텀 에러 클래스
├── retry.ts          # 재시도 래퍼
└── prompts.ts        # 프롬프트 템플릿
```

## 5. 완료 기준

- [ ] SDK 초기화 및 싱글톤 동작
- [ ] `sendMessage` / `sendVisionMessage` 정상 동작
- [ ] `sendMessageForJSON` / `sendVisionMessageForJSON` JSON 파싱 동작
- [ ] `streamMessage` 스트리밍 동작
- [ ] 에러 클래스 4종 정의
- [ ] 1회 재시도 로직 동작
- [ ] 프롬프트 템플릿 8개 정의
- [ ] 단위 테스트 통과 (API mock 사용)
