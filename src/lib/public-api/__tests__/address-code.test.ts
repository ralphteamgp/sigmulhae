import { describe, expect, it } from 'vitest';
import { parseAddressToCode } from '@/lib/public-api/address-code';

describe('parseAddressToCode', () => {
  it('maps known parsed addresses to administrative codes', () => {
    expect(
      parseAddressToCode({
        sido: '서울특별시',
        sigungu: '강남구',
        bjdong: '역삼동',
      })
    ).toEqual({ sigunguCd: '11680', bjdongCd: '10300' });
  });

  it('pads bun and ji values to 4 digits', () => {
    expect(
      parseAddressToCode({
        sido: '서울특별시',
        sigungu: '강남구',
        bjdong: '역삼동',
        bun: '12',
        ji: '0',
      })
    ).toEqual({ sigunguCd: '11680', bjdongCd: '10300', bun: '0012', ji: '0000' });
  });
});
