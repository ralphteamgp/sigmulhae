# 0007 - 주소 분석 API TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. 건축물대장 API 클라이언트 (`src/lib/public-api/building-register.ts`)

- [ ] `fetchBuildingInfo()` 함수 구현
  - GET 요청 → `apis.data.go.kr/.../getBrTitleInfo`
  - 쿼리 파라미터: serviceKey, sigunguCd, bjdongCd, bun?, ji?, _type=json
  - 환경 변수: `BUILDING_REGISTER_API_KEY`
  - 타임아웃: 3초 (`AbortController` 사용)
  - 응답 파싱: `BuildingRegisterResponse` → `BuildingTitleInfo[]`
- [ ] 응답 정상 여부 확인 (`resultCode === '00'`)
- [ ] 에러 핸들링
  - 타임아웃 → 명확한 에러 메시지
  - resultCode !== '00' → 에러 throw
  - 빈 결과 → 빈 배열 반환

## 2. 주소 코드 변환 유틸 (`src/lib/public-api/address-code.ts`)

- [ ] `parseAddressToCode()` 함수 구현
  - AI가 반환한 ParsedAddress → AddressCode 변환
  - 시군구코드, 법정동코드: AI 응답에서 직접 추출 또는 매핑 파일 조회
  - 번/지: 4자리 좌측 0 패딩
- [ ] (선택) `src/data/address-codes.json` 매핑 파일 구축
  - 시군구코드 약 250건
  - 주요 법정동코드 (서울, 경기 중심)

## 3. API Route 구현 (`src/app/api/analyze/address/route.ts`)

### 3.1 기본 구조
- [ ] `POST` 핸들러 함수 export
- [ ] Request body 파싱 (query, dong?, ho?)

### 3.2 유효성 검증
- [ ] query 비어있음 확인 → 400 + `EMPTY_QUERY`
- [ ] query 최소 길이 확인 (2자 이상)

### 3.3 주소 정제 (Claude API)
- [ ] `sendMessageForJSON` 호출
  - 시스템 프롬프트: `ADDRESS_PARSE_SYSTEM`
  - 사용자 프롬프트: `ADDRESS_PARSE_USER` + query 텍스트
- [ ] AI 응답 파싱
  - candidates 배열 (최대 5건)
  - 각 후보의 행정코드 정보 추출
- [ ] 후보 0건 시 → 404 + `NO_ADDRESS_FOUND`

### 3.4 건축물대장 조회
- [ ] 첫 번째 후보의 행정코드로 `fetchBuildingInfo()` 호출
- [ ] 조회 성공 → buildingInfo 필드에 주요 정보 매핑
  - bldNm, grndFlrCnt, ugrndFlrCnt, totArea, strctCdNm, mainPurpsCdNm, useAprDay
- [ ] 조회 실패 → candidates만 반환 + buildingInfo: undefined
  - 502가 아닌 200으로 응답 (부분 성공)

### 3.5 에러 핸들링
- [ ] AI 서비스 오류 → 500 + `AI_SERVICE_ERROR`
- [ ] 건축물대장 API 완전 실패 (네트워크 등) → 502 + `BUILDING_API_ERROR` + `fallback: 'manual_input'`

## 4. 단위 테스트

- [ ] `src/lib/public-api/__tests__/building-register.test.ts`
  - API 호출 성공 → BuildingTitleInfo 반환
  - API 타임아웃 → 에러 throw
  - 비정상 resultCode → 에러 throw
  - 빈 결과 → 빈 배열
- [ ] `src/lib/public-api/__tests__/address-code.test.ts`
  - 정상 주소 → 행정코드 변환
  - 번/지 0 패딩 확인
- [ ] `src/app/api/analyze/address/__tests__/route.test.ts`
  - 정상 요청 → 200 + candidates + buildingInfo
  - 빈 query → 400 + EMPTY_QUERY
  - 주소 못 찾음 → 404 + NO_ADDRESS_FOUND
  - 건축물대장 실패 → 200 + candidates만 (부분 성공)
  - AI 실패 → 500 + AI_SERVICE_ERROR

## 5. 검증

- [ ] `pnpm test` — address API 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
