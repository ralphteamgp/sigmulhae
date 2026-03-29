# 0001 - 프로젝트 초기 설정 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. Next.js 프로젝트 생성

- [ ] `pnpm create next-app` 또는 수동으로 Next.js 15 프로젝트 생성
  - App Router, TypeScript, Tailwind CSS, ESLint, `src/` 디렉토리 옵션 활성화
- [ ] `package.json` scripts 확인 및 정리
  - `dev`, `build`, `start`, `lint`, `test`, `test:e2e`
- [ ] `tsconfig.json`에 strict 모드 + path alias (`@/*` → `src/*`) 설정 확인

## 2. 디렉토리 스캐폴딩

- [ ] `src/app/api/analyze/photo/` 디렉토리 생성
- [ ] `src/app/api/analyze/address/` 디렉토리 생성
- [ ] `src/app/api/analyze/floorplan/` 디렉토리 생성
- [ ] `src/app/api/plants/recommend/` 디렉토리 생성
- [ ] `src/app/api/sunlight/` 디렉토리 생성
- [ ] `src/app/analyze/` 디렉토리 생성
- [ ] `src/app/result/` 디렉토리 생성
- [ ] `src/app/plants/` 디렉토리 생성
- [ ] `src/app/care/` 디렉토리 생성
- [ ] `src/components/ui/` 디렉토리 생성
- [ ] `src/components/onboarding/` 디렉토리 생성
- [ ] `src/components/analyze/` 디렉토리 생성
- [ ] `src/components/floorplan/` 디렉토리 생성
- [ ] `src/components/plants/` 디렉토리 생성
- [ ] `src/components/care/` 디렉토리 생성
- [ ] `src/lib/ai/` 디렉토리 생성
- [ ] `src/lib/sunlight/` 디렉토리 생성
- [ ] `src/lib/crawler/` 디렉토리 생성
- [ ] `src/lib/public-api/` 디렉토리 생성
- [ ] `src/lib/db/` 디렉토리 생성
- [ ] `src/data/` 디렉토리 생성
- [ ] `src/types/` 디렉토리 생성
- [ ] 각 빈 디렉토리에 `.gitkeep` 파일 추가

## 3. 패키지 설치

- [ ] 프로덕션 의존성 설치
  ```bash
  pnpm add dexie @anthropic-ai/sdk suncalc konva react-konva @tanstack/react-query
  ```
- [ ] 개발 의존성 설치
  ```bash
  pnpm add -D vitest @vitejs/plugin-react jsdom prettier prettier-plugin-tailwindcss playwright @playwright/test
  ```
- [ ] `pnpm install` 정상 완료 확인

## 4. 환경 변수

- [ ] `.env.example` 파일 생성 (ANTHROPIC_API_KEY, BUILDING_REGISTER_API_KEY, NEXT_PUBLIC_APP_URL)
- [ ] `.env.local` 파일 생성 (실제 키 값)
- [ ] `.gitignore`에 `.env.local` 포함 확인

## 5. ESLint + Prettier 설정

- [ ] ESLint 설정 파일 확인 (`eslint.config.mjs` 또는 `.eslintrc`)
  - `eslint-config-next` 기반
  - TypeScript 규칙 활성화
- [ ] Prettier 설정 파일 생성 (`.prettierrc`)
  - `singleQuote: true`, `semi: true`, `trailingComma: 'es5'`
  - `prettier-plugin-tailwindcss` 연동
- [ ] ESLint-Prettier 충돌 방지 설정 (`eslint-config-prettier`)
- [ ] `pnpm lint` 실행 시 에러 없음 확인

## 6. Vitest 설정

- [ ] `vitest.config.ts` 작성
  - environment: `jsdom`
  - path alias: `@/` → `src/`
  - include: `src/**/*.test.ts`, `src/**/*.test.tsx`
  - coverage: `v8` 또는 `istanbul`
- [ ] 샘플 테스트 파일 작성 (`src/lib/__tests__/sample.test.ts`)
- [ ] `pnpm test` 실행 확인

## 7. Playwright 설정

- [ ] `playwright.config.ts` 작성
  - testDir: `e2e/`
  - projects: `[{ name: 'chromium', use: devices['Desktop Chrome'] }]`
  - webServer: `pnpm dev` (포트 3000)
- [ ] `e2e/` 디렉토리 생성
- [ ] 샘플 E2E 테스트 파일 작성 (`e2e/sample.spec.ts`)
- [ ] `pnpm test:e2e` 실행 확인

## 8. Git 설정

- [ ] `.gitignore` 확인/보완
  - `node_modules/`, `.next/`, `.env.local`, `coverage/`, `playwright-report/`, `test-results/`
- [ ] `git init` + 초기 커밋

## 9. 빌드 검증

- [ ] `pnpm dev` → localhost:3000 접속 성공
- [ ] `pnpm build` → 빌드 에러 없음
- [ ] `pnpm lint` → 린트 에러 없음
- [ ] TypeScript strict 모드 컴파일 에러 없음
