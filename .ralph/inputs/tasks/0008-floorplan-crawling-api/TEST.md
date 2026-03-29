# 0008 - 평면도 크롤링 API TEST

> 관련: [PRD](PRD.md) | [TODO](TODO.md)

## 검증 시나리오

### 유효성 검증

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0008-01 | 빈 주소 | `{ address: "" }` | 400 + `EMPTY_ADDRESS` | ⬜ |
| T-0008-02 | address 필드 없음 | `{}` | 400 + `EMPTY_ADDRESS` | ⬜ |

### 크롤러 동작

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0008-03 | 크롤링 성공 (이미지+방위) | 유효한 아파트 주소+동+호 | `{ success: true, floorplanImage: base64, buildingAzimuth: number }` | ⬜ |
| T-0008-04 | 크롤링 성공 (이미지만) | 방위 없는 아파트 | `{ success: true, floorplanImage: base64, buildingAzimuth: undefined }` | ⬜ |
| T-0008-05 | 아파트 검색 결과 없음 | 존재하지 않는 주소 | `{ success: false, error: 'NOT_FOUND' }` | ⬜ |
| T-0008-06 | 평면도 없는 아파트 | 평면도 미등록 아파트 | `{ success: true, floorplanImage: undefined }` | ⬜ |
| T-0008-07 | 사이트 접근 불가 | 네트워크 차단 mock | `{ success: false, error: 'SITE_UNAVAILABLE' }` | ⬜ |
| T-0008-08 | 크롤링 타임아웃 | 60초 초과 mock | `{ success: false, error: 'TIMEOUT' }` | ⬜ |
| T-0008-09 | 브라우저 정리 | 크롤링 성공/실패 모두 | 브라우저 프로세스 종료 확인 | ⬜ |

### API Route — 경로 A (평면도 있음)

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0008-10 | 평면도 + AI 분석 성공 | 크롤링 성공 mock | 200 + `analysisSource: 'floorplan'` + windows | ⬜ |
| T-0008-11 | floorplanImage 포함 | 크롤링 성공 mock | base64 이미지 문자열 포함 | ⬜ |
| T-0008-12 | buildingAzimuth 포함 | 방위 추출 성공 mock | 0~360 범위 숫자 | ⬜ |
| T-0008-13 | windows direction 유효 | AI 분석 결과 | 모든 direction 8방위 | ⬜ |
| T-0008-14 | windows confidence | AI 분석 결과 | 0 ≤ confidence ≤ 1 | ⬜ |

### API Route — 경로 B (regulation_only)

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0008-15 | 크롤링 실패 → 폴백 | 크롤링 실패 mock | 200 + `analysisSource: 'regulation_only'` | ⬜ |
| T-0008-16 | regulation_only confidence | 폴백 분석 결과 | 모든 confidence ≤ 0.3 | ⬜ |
| T-0008-17 | floorplanImage 없음 | 크롤링 실패 | `floorplanImage: undefined` | ⬜ |

### 에러 케이스

| # | 시나리오 | 입력 | 기대 결과 | 상태 |
|---|----------|------|-----------|------|
| T-0008-18 | 크롤링+AI 모두 실패 | 양쪽 실패 mock | 500 + `CRAWLING_ERROR` | ⬜ |
| T-0008-19 | AI만 실패 | 크롤링 성공 + AI 실패 mock | 500 + `AI_SERVICE_ERROR` | ⬜ |
| T-0008-20 | AI 재시도 후 성공 | 1회 실패 → 2회 성공 mock | 200 + 정상 응답 | ⬜ |
