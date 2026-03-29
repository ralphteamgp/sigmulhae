# 0009 - 채광 계산 엔진 TODO

> 관련: [PRD](PRD.md) | [TEST](TEST.md)

## 1. 태양 위치 계산 (`src/lib/sunlight/solar.ts`)

- [ ] `getDailySolarPositions()` 구현
  - suncalc.getPosition() 래핑
  - 일출~일몰 시간 범위 내 30분 간격 계산
  - suncalc 방위각(남=0, 서=양수) → 일반 방위각(북=0, 동=90°) 변환
- [ ] `getSunTimes()` 구현
  - suncalc.getTimes() 래핑
  - sunrise, sunset, solarNoon 반환
- [ ] 기준 날짜: 춘분 (3월 20일) 상수 정의

## 2. 직달일사 시간 계산 (`src/lib/sunlight/direct-sunlight.ts`)

- [ ] 8방위 → 방위각 범위 매핑 테이블 정의
  - N: 337.5~22.5° / NE: 22.5~67.5° / E: 67.5~112.5° / ...
- [ ] 창문 방위각 범위 내 태양 존재 여부 판정 함수
  - 태양 방위각이 창문 방위각 범위 ± 허용 오차 내
  - 태양 고도 > 0° (수평선 위)
- [ ] 창문 크기별 보정계수 적용
  - large: 1.0, medium: 0.7, small: 0.4
- [ ] `calculateDirectSunlightHours()` 구현
  - 30분 단위 일사 여부 합산
  - 보정계수 적용 후 총 시간 반환
- [ ] 다중 창문 합산 로직 (동일 방향 창문 중복 방지)

## 3. 채광 등급 산출 (`src/lib/sunlight/grade.ts`)

- [ ] `calculateSunlightGrade()` 구현
  - ≥ 4시간 → 'strong'
  - ≥ 2시간 → 'medium'
  - < 2시간 → 'weak'
- [ ] `calculateOverallGrade()` 구현
  - 전략: 모든 창문 중 최대 직달일사 시간 기준
  - 대안: 창문 크기 가중 평균 (large=3, medium=2, small=1)

## 4. 채광 구역 매핑 (`src/lib/sunlight/zone-mapper.ts`)

- [ ] `mapSunlightZones()` 구현
  - 각 창문의 position 기준 구역 생성
  - 창문 크기별 구역 반경 설정
    - large: 정규화 0.3
    - medium: 정규화 0.2
    - small: 정규화 0.1
  - 구역의 area (x, y, width, height) 계산
- [ ] 거리 기반 등급 하락
  - 창문 근접: 원래 등급
  - 중간 거리: 1단계 하락
  - 먼 거리: 2단계 하락
- [ ] 구역 겹침 처리
  - 동일 영역에 복수 구역 → 높은 등급 우선

## 5. 인덱스 파일 (`src/lib/sunlight/index.ts`)

- [ ] 모든 public 함수 re-export

## 6. API Route 구현 (`src/app/api/sunlight/route.ts`)

### 6.1 유효성 검증
- [ ] latitude 범위: -90 ~ 90 → `INVALID_COORDINATES`
- [ ] longitude 범위: -180 ~ 180 → `INVALID_COORDINATES`
- [ ] windows 배열 비어있음 → `NO_WINDOWS`
- [ ] 각 window의 direction, size 유효값 → `INVALID_WINDOW_DATA`

### 6.2 계산 파이프라인
- [ ] 기준 날짜 (춘분) 설정
- [ ] `getDailySolarPositions()` 호출
- [ ] 각 창문별 `calculateDirectSunlightHours()` 호출
- [ ] 각 창문별 `calculateSunlightGrade()` 호출
- [ ] `calculateOverallGrade()` 호출
- [ ] `mapSunlightZones()` 호출
- [ ] 200 OK 응답 반환

### 6.3 에러 핸들링
- [ ] 계산 중 예기치 않은 에러 → 500 + `CALCULATION_ERROR`

## 7. 단위 테스트

- [ ] `src/lib/sunlight/__tests__/solar.test.ts`
  - 서울 좌표 춘분 기준 일출/일몰 시각 검증 (오차 ±10분)
  - 30분 간격 태양 위치 배열 크기 검증
  - 정오 태양 고도 양수 확인
- [ ] `src/lib/sunlight/__tests__/direct-sunlight.test.ts`
  - 남향(S) 대형(large) 창문: 직달일사 4시간 이상
  - 북향(N) 창문: 직달일사 거의 0
  - 동향(E) 창문: 오전에만 일사
  - 서향(W) 창문: 오후에만 일사
  - 창문 크기별 보정계수 적용 확인
- [ ] `src/lib/sunlight/__tests__/grade.test.ts`
  - 4.0시간 → 'strong'
  - 3.0시간 → 'medium'
  - 1.5시간 → 'weak'
  - 경계값: 4.0 → 'strong', 3.99 → 'medium', 2.0 → 'medium', 1.99 → 'weak'
- [ ] `src/lib/sunlight/__tests__/zone-mapper.test.ts`
  - 단일 창문 → 1개 구역 생성
  - 복수 창문 → 복수 구역 생성
  - 구역 크기가 창문 크기에 비례
  - 겹침 영역 등급 우선순위
- [ ] `src/app/api/sunlight/__tests__/route.test.ts`
  - 정상 요청 → 200 + zones + overallGrade
  - 잘못된 좌표 → 400 + INVALID_COORDINATES
  - 빈 창문 → 400 + NO_WINDOWS

## 8. 검증

- [ ] `pnpm test` — sunlight 관련 테스트 전체 PASS
- [ ] TypeScript 컴파일 에러 없음
- [ ] 서울 남향 아파트 기준 채광 등급 'strong' 확인 (상식 검증)
