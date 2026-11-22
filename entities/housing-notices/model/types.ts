/** 청약홈 APT 분양 공고 한 건 (주택형별 신혼 특공 합산) */
export type ApplyhomeItem = {
  id: string;
  name: string;
  houseType: string; // APT / 신혼희망타운
  saleType: string; // 민영 / 국민
  region: string;
  address: string;
  totalUnits: number;
  newlywedUnits: number;
  newlywedApplicants: number | null;
  newlywedRatio: number | null;
  isNewlywedTown: boolean;
  announceDate: string;
  specialStart: string;
  winnerDate: string;
  url: string;
};

export const MyhomeKind = {
  RENT: '임대',
  SALE: '분양',
} as const;
export type MyhomeKind = (typeof MyhomeKind)[keyof typeof MyhomeKind];

/** 마이홈 공공주택 모집공고 한 건 (단지별 행을 공고 단위로 묶음) */
export type MyhomeItem = {
  id: string;
  kind: MyhomeKind;
  name: string;
  status: string;
  supplier: string;
  supplyType: string;
  houseType: string;
  regions: string[];
  complexes: number;
  announceDate: string;
  beginDate: string;
  endDate: string;
  url: string;
  newlyweds: boolean;
};

/** GET /api/housing 응답 */
export type HousingSnapshot = {
  fetchedAt: string;
  applyhome: ApplyhomeItem[];
  myhome: MyhomeItem[];
};

/** 청약홈 주택구분 중 전 세대가 신혼부부 대상인 값 */
export const NEWLYWED_TOWN_HOUSE_TYPE = '신혼희망타운';
