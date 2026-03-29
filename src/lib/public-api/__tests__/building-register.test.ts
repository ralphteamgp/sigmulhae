import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBuildingInfo } from '@/lib/public-api/building-register';

describe('fetchBuildingInfo', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.BUILDING_REGISTER_API_KEY;
    vi.restoreAllMocks();
  });

  it('returns building info rows on successful API responses', async () => {
    process.env.BUILDING_REGISTER_API_KEY = 'test-key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '00', resultMsg: 'OK' },
          body: {
            items: {
              item: [
                {
                  platPlc: '서울 강남구',
                  newPlatPlc: '서울 강남구 테헤란로 1',
                  bldNm: '테스트아파트',
                  dongNm: '101동',
                  grndFlrCnt: 20,
                  ugrndFlrCnt: 2,
                  heit: 55,
                  platArea: 100,
                  archArea: 80,
                  totArea: 1000,
                  strctCdNm: '철근콘크리트구조',
                  mainPurpsCdNm: '공동주택',
                  useAprDay: '20200101',
                },
              ],
            },
            numOfRows: 10,
            pageNo: 1,
            totalCount: 1,
          },
        },
      }),
    }) as typeof fetch;

    const result = await fetchBuildingInfo({ sigunguCd: '11680', bjdongCd: '10300', bun: '12' });

    expect(result).toHaveLength(1);
    expect(result[0].bldNm).toBe('테스트아파트');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('bun=0012'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('throws on timeout, non-00 result codes, and missing keys', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('timeout')) as typeof fetch;
    await expect(fetchBuildingInfo({ sigunguCd: '11680', bjdongCd: '10300' })).rejects.toThrow(
      'BUILDING_REGISTER_API_KEY'
    );

    process.env.BUILDING_REGISTER_API_KEY = 'test-key';
    await expect(fetchBuildingInfo({ sigunguCd: '11680', bjdongCd: '10300' })).rejects.toThrow(
      'timeout'
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '99', resultMsg: 'failure' },
          body: { items: {}, numOfRows: 10, pageNo: 1, totalCount: 0 },
        },
      }),
    }) as typeof fetch;

    await expect(fetchBuildingInfo({ sigunguCd: '11680', bjdongCd: '10300' })).rejects.toThrow(
      'failure'
    );
  });

  it('returns an empty list when the API response has no rows', async () => {
    process.env.BUILDING_REGISTER_API_KEY = 'test-key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '00', resultMsg: 'OK' },
          body: { items: {}, numOfRows: 10, pageNo: 1, totalCount: 0 },
        },
      }),
    }) as typeof fetch;

    await expect(fetchBuildingInfo({ sigunguCd: '11680', bjdongCd: '10300' })).resolves.toEqual([]);
  });
});
