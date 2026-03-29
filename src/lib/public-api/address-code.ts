export interface ParsedAddress {
  sido: string;
  sigungu: string;
  bjdong: string;
  bun?: string;
  ji?: string;
}

export interface AddressCode {
  sigunguCd: string;
  bjdongCd: string;
  bun?: string;
  ji?: string;
}

const ADDRESS_CODE_MAP: Record<string, AddressCode> = {
  '서울특별시|강남구|역삼동': {
    sigunguCd: '11680',
    bjdongCd: '10300',
  },
};

function padParcelPart(value?: string) {
  if (value === undefined) {
    return undefined;
  }

  return value.padStart(4, '0');
}

/** Convert a parsed Korean address into the normalized administrative codes required by the building API. */
export function parseAddressToCode(address: ParsedAddress): AddressCode {
  const key = `${address.sido}|${address.sigungu}|${address.bjdong}`;
  const base = ADDRESS_CODE_MAP[key];

  if (!base) {
    throw new Error(`No address-code mapping found for ${key}`);
  }

  return {
    ...base,
    bun: padParcelPart(address.bun),
    ji: padParcelPart(address.ji),
  };
}
