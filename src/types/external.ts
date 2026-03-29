/** 건축물대장 API 요청 파라미터. */
export interface BuildingRegisterRequest {
  /** data.go.kr 서비스 키 */
  serviceKey: string;
  /** 시군구 코드 */
  sigunguCd: string;
  /** 법정동 코드 */
  bjdongCd: string;
  /** 대지 구분 코드 */
  platGbCd?: string;
  /** 번 */
  bun?: string;
  /** 지 */
  ji?: string;
  /** 페이지당 결과 수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
  /** 응답 포맷 */
  _type?: string;
}

/** 건축물대장 표제부의 핵심 필드. */
export interface BuildingTitleInfo {
  /** 대지 위치 */
  platPlc: string;
  /** 도로명 주소 */
  newPlatPlc: string;
  /** 건물명 */
  bldNm: string;
  /** 동명 */
  dongNm: string;
  /** 지상 층수 */
  grndFlrCnt: number;
  /** 지하 층수 */
  ugrndFlrCnt: number;
  /** 높이 */
  heit: number;
  /** 대지 면적 */
  platArea: number;
  /** 건축 면적 */
  archArea: number;
  /** 연면적 */
  totArea: number;
  /** 구조명 */
  strctCdNm: string;
  /** 기타 구조 */
  etcStrct?: string;
  /** 주용도 */
  mainPurpsCdNm: string;
  /** 기타 용도 */
  etcPurps?: string;
  /** 사용 승인일 */
  useAprDay: string;
  /** 세대 수 */
  hhldCnt?: number;
  /** 호 수 */
  hoCnt?: number;
}

/** 건축물대장 API 응답 헤더. */
export interface BuildingRegisterResponseHeader {
  /** 결과 코드 */
  resultCode: string;
  /** 결과 메시지 */
  resultMsg: string;
}

/** 건축물대장 API 응답 본문. */
export interface BuildingRegisterResponseBody {
  /** 표제부 항목 목록 */
  items: {
    item: BuildingTitleInfo[];
  };
  /** 페이지당 결과 수 */
  numOfRows: number;
  /** 현재 페이지 */
  pageNo: number;
  /** 전체 결과 수 */
  totalCount: number;
}

/** 건축물대장 API 전체 응답 구조. */
export interface BuildingRegisterResponse {
  /** API envelope */
  response: {
    header: BuildingRegisterResponseHeader;
    body: BuildingRegisterResponseBody;
  };
}
