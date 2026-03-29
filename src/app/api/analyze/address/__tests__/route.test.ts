import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendMessageForJSON } from '@/lib/ai';
import { fetchBuildingInfo } from '@/lib/public-api/building-register';
import { POST } from '@/app/api/analyze/address/route';

vi.mock('@/lib/ai', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai')>('@/lib/ai');
  return { ...actual, sendMessageForJSON: vi.fn() };
});

vi.mock('@/lib/public-api/building-register', () => ({
  fetchBuildingInfo: vi.fn(),
}));

const sendMessageForJSONMock = vi.mocked(sendMessageForJSON);
const fetchBuildingInfoMock = vi.mocked(fetchBuildingInfo);

function buildRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/analyze/address', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze/address', () => {
  beforeEach(() => {
    sendMessageForJSONMock.mockReset();
    fetchBuildingInfoMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty or too-short queries', async () => {
    const emptyResponse = await POST(buildRequest({ query: '' }));
    const missingResponse = await POST(buildRequest({}));
    const shortResponse = await POST(buildRequest({ query: '강' }));

    expect(emptyResponse.status).toBe(400);
    await expect(emptyResponse.json()).resolves.toMatchObject({ code: 'EMPTY_QUERY' });
    expect(missingResponse.status).toBe(400);
    await expect(missingResponse.json()).resolves.toMatchObject({ code: 'EMPTY_QUERY' });
    expect(shortResponse.status).toBe(400);
    await expect(shortResponse.json()).resolves.toMatchObject({ code: 'EMPTY_QUERY' });
  });

  it('returns candidates and building info for a valid address query', async () => {
    sendMessageForJSONMock.mockResolvedValue({
      candidates: [
        {
          address: '서울특별시 강남구 테헤란로 123',
          jibunAddress: '서울특별시 강남구 역삼동 123-45',
          sigunguCd: '11680',
          bjdongCd: '10300',
          bun: '12',
          ji: '3',
        },
      ],
    });
    fetchBuildingInfoMock.mockResolvedValue([
      {
        platPlc: '서울특별시 강남구',
        newPlatPlc: '서울특별시 강남구 테헤란로 123',
        bldNm: '테스트아파트',
        dongNm: '101동',
        grndFlrCnt: 25,
        ugrndFlrCnt: 2,
        heit: 70,
        platArea: 100,
        archArea: 80,
        totArea: 1200,
        strctCdNm: '철근콘크리트구조',
        mainPurpsCdNm: '공동주택',
        useAprDay: '20200101',
      },
    ]);

    const response = await POST(buildRequest({ query: '강남구 역삼동 센트럴푸르지오' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.candidates).toHaveLength(1);
    expect(body.buildingInfo.bldNm).toBe('테스트아파트');
  });

  it('returns NO_ADDRESS_FOUND when the ai returns no candidates', async () => {
    sendMessageForJSONMock.mockResolvedValue({ candidates: [] });

    const response = await POST(buildRequest({ query: '가나다라마바사 123' }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ code: 'NO_ADDRESS_FOUND' });
  });

  it('returns partial success when building info lookup fails softly', async () => {
    sendMessageForJSONMock.mockResolvedValue({
      candidates: [
        {
          address: '서울특별시 강남구 테헤란로 123',
          sigunguCd: '11680',
          bjdongCd: '10300',
        },
      ],
    });
    fetchBuildingInfoMock.mockResolvedValue([]);

    const response = await POST(buildRequest({ query: '서울시 강남구 테헤란로 123' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.candidates).toHaveLength(1);
    expect(body.buildingInfo).toBeUndefined();
  });

  it('returns explicit fallback codes for building API and ai failures', async () => {
    sendMessageForJSONMock.mockResolvedValue({
      candidates: [
        {
          address: '서울특별시 강남구 테헤란로 123',
          sigunguCd: '11680',
          bjdongCd: '10300',
        },
      ],
    });
    fetchBuildingInfoMock.mockRejectedValueOnce(new Error('network error'));
    const buildingFailureResponse = await POST(buildRequest({ query: '서울시 강남구 테헤란로 123' }));

    sendMessageForJSONMock.mockRejectedValueOnce(new Error('ai failed'));
    const aiFailureResponse = await POST(buildRequest({ query: '서울시 강남구 테헤란로 123' }));

    expect(buildingFailureResponse.status).toBe(502);
    await expect(buildingFailureResponse.json()).resolves.toMatchObject({
      code: 'BUILDING_API_ERROR',
      fallback: 'manual_input',
    });
    expect(aiFailureResponse.status).toBe(500);
    await expect(aiFailureResponse.json()).resolves.toMatchObject({ code: 'AI_SERVICE_ERROR' });
  });
});
