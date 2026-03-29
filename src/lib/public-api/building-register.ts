import type { BuildingRegisterResponse, BuildingTitleInfo } from '@/types/external';

const API_ENDPOINT =
  'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';
const TIMEOUT_MS = 3000;

export interface FetchBuildingInfoParams {
  sigunguCd: string;
  bjdongCd: string;
  bun?: string;
  ji?: string;
}

/** 건축물대장 표제부 조회 */
export async function fetchBuildingInfo(
  params: FetchBuildingInfoParams
): Promise<BuildingTitleInfo[]> {
  const apiKey = process.env.BUILDING_REGISTER_API_KEY;
  if (!apiKey) {
    throw new Error('BUILDING_REGISTER_API_KEY가 설정되지 않았습니다');
  }

  const url = new URL(API_ENDPOINT);
  url.searchParams.set('serviceKey', apiKey);
  url.searchParams.set('sigunguCd', params.sigunguCd);
  url.searchParams.set('bjdongCd', params.bjdongCd);
  url.searchParams.set('_type', 'json');
  url.searchParams.set('numOfRows', '10');

  if (params.bun) url.searchParams.set('bun', params.bun.padStart(4, '0'));
  if (params.ji) url.searchParams.set('ji', params.ji.padStart(4, '0'));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Building register API responded with ${res.status}`);
    }

    const data = (await res.json()) as BuildingRegisterResponse;

    if (data.response.header.resultCode !== '00') {
      throw new Error(`API error: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } finally {
    clearTimeout(timeout);
  }
}
