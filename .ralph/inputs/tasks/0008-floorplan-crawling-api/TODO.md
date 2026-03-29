# 0008 - 평면도 크롤링 API TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. Playwright 브라우저 관리 (`src/lib/crawler/browser.ts`)

- [ ] 브라우저 인스턴스 생성/관리 함수
  - `launchBrowser()` — headless Chromium 실행
  - `closeBrowser()` — 정리
- [ ] 공통 설정
  - headless: true
  - User-Agent: 일반 Chrome UA
  - viewport: 1280×720
- [ ] 리소스 필터링 (이미지만 허용, CSS/폰트 차단 옵션)
- [ ] 전체 타임아웃 관리 (60초)

## 2. 호갱노노 크롤러 (`src/lib/crawler/hogangnono.ts`)

### 2.1 검색 및 네비게이션
- [ ] 호갱노노 사이트 접속
- [ ] 주소 텍스트로 아파트 검색
- [ ] 검색 결과에서 해당 아파트 클릭 (주소 매칭)
- [ ] 단지 상세 페이지 이동 확인

### 2.2 평면도 이미지 추출
- [ ] 동·호수 기반 호실 페이지 네비게이션
- [ ] 평면도 이미지 요소 탐색 (CSS 선택자 / XPath)
- [ ] 이미지 URL 추출 → fetch → base64 변환
- [ ] 이미지 없는 경우 null 반환

### 2.3 건물 방위 각도 추출
- [ ] 단지 배치도 페이지/섹션 탐색
- [ ] 나침반/방위 표시 요소 추출
- [ ] 방위 각도 (0~360, 북=0) 파싱
- [ ] 추출 실패 시 undefined 반환

### 2.4 에러 핸들링
- [ ] 사이트 접근 불가 → `{ success: false, error: 'SITE_UNAVAILABLE' }`
- [ ] 아파트 검색 결과 없음 → `{ success: false, error: 'NOT_FOUND' }`
- [ ] 평면도 없는 아파트 → `{ success: true, floorplanImage: undefined }`
- [ ] 크롤링 타임아웃 (60초) → `{ success: false, error: 'TIMEOUT' }`
- [ ] 요청 간 1~2초 지연 (`page.waitForTimeout`)

### 2.5 안정성
- [ ] try-finally로 브라우저 반드시 종료
- [ ] 예기치 않은 팝업/모달 닫기 처리
- [ ] 네비게이션 실패 시 재시도 (1회)

## 3. API Route 구현 (`src/app/api/analyze/floorplan/route.ts`)

### 3.1 기본 구조
- [ ] `POST` 핸들러 함수 export
- [ ] Request body 파싱 (address, dong?, ho?)
- [ ] 유효성 검증: address 비어있음 → 400 + `EMPTY_ADDRESS`

### 3.2 크롤링 실행
- [ ] `crawlFloorplan(address, dong, ho)` 호출
- [ ] 크롤링 결과에 따라 분석 경로 분기

### 3.3 경로 A: 평면도 있음
- [ ] `sendVisionMessageForJSON` 호출
  - 이미지: 평면도 base64
  - 시스템 프롬프트: `FLOORPLAN_ANALYSIS_SYSTEM`
  - 사용자 프롬프트: `FLOORPLAN_ANALYSIS_USER` + 방위각도 + 건축물대장 정보
- [ ] AI 응답 파싱 → windows 배열
- [ ] `analysisSource: 'floorplan'` 설정

### 3.4 경로 B: 평면도 없음 (regulation_only)
- [ ] `sendMessageForJSON` 호출 (이미지 없이)
  - 건축물대장 정보 + 건축법령 기준으로 창문 추정
- [ ] confidence 상한 0.3으로 제한
- [ ] `analysisSource: 'regulation_only'` 설정

### 3.5 응답 후처리
- [ ] windows 배열 direction/size/confidence/position 유효성 검증
- [ ] floorplanImage, buildingAzimuth 포함 여부 설정
- [ ] 200 OK 응답 반환

### 3.6 에러 핸들링
- [ ] 크롤링 + AI 모두 실패 → 500 + `CRAWLING_ERROR`
- [ ] AI만 실패 → 500 + `AI_SERVICE_ERROR`

## 4. 단위 테스트

- [ ] `src/lib/crawler/__tests__/hogangnono.test.ts`
  - 크롤링 성공 mock → 이미지 + 방위각 반환
  - 검색 결과 없음 → 실패 결과
  - 타임아웃 → 실패 결과
  - (통합 테스트는 실제 사이트 접속 필요 — 선택)
- [ ] `src/lib/crawler/__tests__/browser.test.ts`
  - 브라우저 시작/종료
  - 타임아웃 설정 확인
- [ ] `src/app/api/analyze/floorplan/__tests__/route.test.ts`
  - 평면도 있음 → 200 + floorplan 분석 결과
  - 평면도 없음 → 200 + regulation_only 결과
  - 빈 주소 → 400 + EMPTY_ADDRESS
  - 크롤링+AI 실패 → 500

## 5. 검증

- [ ] `pnpm test` — floorplan API 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
- [ ] (선택) 실제 호갱노노 크롤링 수동 테스트
