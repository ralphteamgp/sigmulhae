# 0001 - 프로젝트 초기 설정 TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

| # | 시나리오 | 검증 방법 | 기대 결과 | 상태 |
|---|----------|-----------|-----------|------|
| T-0001-01 | pnpm install 성공 | `pnpm install` 실행 | 에러 없이 node_modules 생성 | ⬜ |
| T-0001-02 | dev 서버 기동 | `pnpm dev` → 브라우저 접속 | localhost:3000 200 응답 | ⬜ |
| T-0001-03 | 프로덕션 빌드 | `pnpm build` 실행 | 에러 없이 `.next/` 생성 | ⬜ |
| T-0001-04 | TypeScript strict 모드 | `npx tsc --noEmit` 실행 | 타입 에러 0건 | ⬜ |
| T-0001-05 | ESLint 통과 | `pnpm lint` 실행 | 에러 0건 | ⬜ |
| T-0001-06 | Vitest 실행 | `pnpm test` 실행 | 샘플 테스트 PASS | ⬜ |
| T-0001-07 | Playwright 실행 | `pnpm test:e2e` 실행 | 샘플 E2E 테스트 PASS | ⬜ |
| T-0001-08 | 디렉토리 구조 | `ls -R src/` 확인 | 스펙 §3 디렉토리 전체 존재 | ⬜ |
| T-0001-09 | 환경 변수 템플릿 | `.env.example` 파일 확인 | 3개 변수 키 존재 | ⬜ |
| T-0001-10 | .gitignore 검증 | `.gitignore` 내용 확인 | .env.local, node_modules, .next 포함 | ⬜ |
| T-0001-11 | path alias 동작 | 테스트에서 `@/` import 사용 | 정상 resolve | ⬜ |
| T-0001-12 | Tailwind CSS 동작 | 샘플 페이지에 Tailwind 클래스 적용 | 스타일 정상 반영 | ⬜ |
