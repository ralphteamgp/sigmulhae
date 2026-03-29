# 0001 - 프로젝트 초기 설정

| 항목 | 내용 |
|------|------|
| 태스크 ID | 0001 |
| 상위 문서 | [태스크 총괄 PRD](../PRD.md) |
| 기반 스펙 | [Tech Architecture Design](../../superpowers/specs/2026-03-29-tech-architecture-design.md) §2, §3, §10 |
| 의존성 | 없음 |
| 우선순위 | P0 |
| 상태 | TODO |

---

## 1. 목적

PlantFit 프로젝트의 기반 환경을 구성한다. Next.js 15 App Router 기반 모놀리스 구조로, TypeScript 전면 적용, 개발도구(ESLint, Prettier, Vitest, Playwright) 설정, 패키지 매니저(pnpm) 세팅까지 포함한다.

## 2. 범위

### 2.1 포함

- Next.js 15 (App Router) 프로젝트 생성
- TypeScript 5.x 설정 (`tsconfig.json`)
- pnpm 패키지 매니저 설정
- Tailwind CSS 4.x 설정
- ESLint + Prettier 설정
- Vitest 설정 (단위 테스트)
- Playwright 설정 (E2E 테스트 + 크롤러 용도)
- 환경 변수 파일 구조 (`.env.local`, `.env.example`)
- 디렉토리 구조 스캐폴딩 (§3 기준)
- Git 초기화 + `.gitignore`

### 2.2 제외

- UI 컴포넌트 구현
- API Route 구현
- 라이브러리 비즈니스 로직

## 3. 상세 요구사항

### 3.1 Next.js 15 프로젝트

- `create-next-app` 또는 수동 설정
- App Router 사용 (`src/app/` 디렉토리)
- `src/` 디렉토리 구조 사용
- React 19 + TypeScript

### 3.2 디렉토리 스캐폴딩

스펙 §3 기준으로 아래 디렉토리 생성 (빈 `.gitkeep` 파일로 구조 유지):

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── photo/
│   │   │   ├── address/
│   │   │   └── floorplan/
│   │   ├── plants/
│   │   │   └── recommend/
│   │   └── sunlight/
│   ├── analyze/
│   ├── result/
│   ├── plants/
│   └── care/
├── components/
│   ├── ui/
│   ├── onboarding/
│   ├── analyze/
│   ├── floorplan/
│   ├── plants/
│   └── care/
├── lib/
│   ├── ai/
│   ├── sunlight/
│   ├── crawler/
│   ├── public-api/
│   └── db/
├── data/
└── types/
```

### 3.3 패키지 설치

**프로덕션 의존성:**

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 15.x | 프레임워크 |
| react / react-dom | 19.x | UI |
| typescript | 5.x | 타입 시스템 |
| tailwindcss | 4.x | 스타일링 |
| dexie | 4.x | IndexedDB 래퍼 |
| @anthropic-ai/sdk | latest | Claude API |
| suncalc | 1.x | 태양 위치 계산 |
| konva + react-konva | latest | 2D 캔버스 |
| @tanstack/react-query | 5.x | 서버 상태 관리 |

**개발 의존성:**

| 패키지 | 버전 | 용도 |
|--------|------|------|
| eslint + eslint-config-next | latest | 린터 |
| prettier + prettier-plugin-tailwindcss | latest | 포맷터 |
| vitest + @vitejs/plugin-react | latest | 단위 테스트 |
| playwright + @playwright/test | latest | E2E + 크롤링 |
| @types/react + @types/node | latest | 타입 정의 |

### 3.4 환경 변수

`.env.example` 파일에 필요한 환경 변수 목록 정의:

```env
# Claude API
ANTHROPIC_API_KEY=

# 건축물대장 공공API
BUILDING_REGISTER_API_KEY=

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`.env.local`은 `.gitignore`에 포함.

### 3.5 ESLint + Prettier

- `eslint-config-next` 기반
- Prettier와 ESLint 충돌 방지 (`eslint-config-prettier`)
- TypeScript strict 모드

### 3.6 Vitest 설정

- `vitest.config.ts` 작성
- `src/` 기준 path alias 설정 (`@/`)
- React 컴포넌트 테스트용 jsdom 환경
- coverage 리포터 설정

### 3.7 Playwright 설정

- `playwright.config.ts` 작성
- E2E 테스트 디렉토리: `e2e/`
- 크롤러 용도로도 사용 (호갱노노)
- 브라우저: chromium만 (MVP)

### 3.8 Git 설정

- `.gitignore`: node_modules, .next, .env.local, coverage, playwright-report 등
- 초기 커밋 구조

## 4. 완료 기준

- [ ] `pnpm install` 성공
- [ ] `pnpm dev` → localhost:3000 접속 가능
- [ ] `pnpm build` 성공 (에러 없음)
- [ ] `pnpm test` (Vitest) 실행 가능
- [ ] `pnpm test:e2e` (Playwright) 실행 가능
- [ ] 모든 디렉토리 구조 존재
- [ ] `.env.example` 파일 존재
- [ ] TypeScript strict 모드 에러 없음
