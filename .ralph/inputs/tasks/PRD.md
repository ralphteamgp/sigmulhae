# PlantFit - 태스크 총괄 PRD

| 항목 | 내용 |
|------|------|
| 프로젝트 | PlantFit - AI 기반 실내 식물 추천 서비스 |
| 기반 문서 | [Tech Architecture Design](../superpowers/specs/2026-03-29-tech-architecture-design.md) |
| 작성일 | 2026-03-29 |
| 상태 | Draft |

---

## 태스크 목록

| # | 태스크 | 설명 | 의존성 | 우선순위 |
|---|--------|------|--------|----------|
| 0001 | [프로젝트 초기 설정](0001-project-setup/PRD.md) | Next.js 15, TypeScript, 개발도구 세팅 | 없음 | P0 |
| 0002 | [공유 타입 정의](0002-shared-types/PRD.md) | TypeScript 인터페이스/타입 전체 정의 | 0001 | P0 |
| 0003 | [Dexie.js 데이터베이스](0003-dexie-database/PRD.md) | IndexedDB 스키마, CRUD 헬퍼 | 0001, 0002 | P0 |
| 0004 | [식물 시드 데이터](0004-plant-seed-data/PRD.md) | plants.json 구축 | 0002 | P1 |
| 0005 | [AI 클라이언트 래퍼](0005-ai-client-wrapper/PRD.md) | Claude API 공통 래퍼, 에러 처리, 재시도 | 0001, 0002 | P0 |
| 0006 | [사진 분석 API](0006-photo-analysis-api/PRD.md) | POST /api/analyze/photo - Claude Vision | 0005 | P1 |
| 0007 | [주소 분석 API](0007-address-analysis-api/PRD.md) | POST /api/analyze/address - 건축물대장 | 0005 | P1 |
| 0008 | [평면도 크롤링 API](0008-floorplan-crawling-api/PRD.md) | POST /api/analyze/floorplan - 호갱노노 | 0005, 0007 | P1 |
| 0009 | [채광 계산 엔진](0009-sunlight-calculation/PRD.md) | POST /api/sunlight - suncalc 기반 | 0002 | P1 |
| 0010 | [식물 추천 API](0010-plant-recommendation-api/PRD.md) | POST /api/plants/recommend | 0004, 0005, 0009 | P2 |

## 의존성 그래프

```
0001 (프로젝트 설정)
 ├── 0002 (공유 타입)
 │    ├── 0003 (Dexie DB) ← 0001
 │    ├── 0004 (식물 데이터)
 │    └── 0009 (채광 계산)
 ├── 0005 (AI 클라이언트) ← 0002
 │    ├── 0006 (사진 분석)
 │    ├── 0007 (주소 분석)
 │    │    └── 0008 (평면도 크롤링) ← 0005
 │    └── 0010 (식물 추천) ← 0004, 0009
```

## 제외 범위 (별도 태스크)

- UI 컴포넌트 전체 (`src/components/`)
- 페이지 라우팅 및 레이아웃 (`src/app/page.tsx`, `src/app/layout.tsx`)
- 클라이언트 상태 관리 (React Query 설정, UI 상태)
- 온보딩 화면, 결과 화면, 케어 대시보드 등 모든 프론트엔드 화면
