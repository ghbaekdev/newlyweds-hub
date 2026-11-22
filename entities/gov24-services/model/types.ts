/** 보조금24 serviceList 한 건 (API 필드명 그대로) */
export type Gov24Service = {
  서비스ID: string;
  지원유형?: string;
  서비스명?: string;
  서비스목적요약?: string;
  지원대상?: string;
  선정기준?: string;
  지원내용?: string;
  신청방법?: string;
  신청기한?: string;
  상세조회URL?: string;
  소관기관코드?: string;
  소관기관명?: string;
  부서명?: string;
  조회수?: number;
  소관기관유형?: string;
  사용자구분?: string;
  서비스분야?: string;
  접수기관?: string;
  전화문의?: string;
  등록일시?: string;
  수정일시?: string;
  신청기한유형?: string;
};

export type ServiceSnapshot = {
  fetchedAt: string;
  totalCount: number;
  services: Gov24Service[];
};

/** 키워드를 찾는 필드 */
export const SEARCH_FIELDS = [
  '서비스명',
  '서비스목적요약',
  '지원대상',
  '선정기준',
  '지원내용',
] as const;
export type SearchField = (typeof SEARCH_FIELDS)[number];

export type KeywordHit = { field: SearchField; keyword: string; snippet: string };

/** GET /api/gov24/newlywed 응답의 서비스 한 건 */
export type NewlywedServiceItem = {
  id: string;
  name: string;
  org: string;
  orgType: string;
  field: string;
  supportType: string;
  target: string;
  content: string;
  deadline: string;
  url: string;
  views: number;
  keywords: string[];
  hits: KeywordHit[];
};

export type CountRow = [label: string, count: number];

/** GET /api/gov24/newlywed 응답 */
export type NewlywedServicesResult = {
  fetchedAt: string;
  totalCount: number;
  loadedCount: number;
  matchedCount: number;
  keywords: string[];
  stats: Record<'byKeyword' | 'byField' | 'byOrgType' | 'byServiceField', CountRow[]>;
  items: NewlywedServiceItem[];
};

/** GET /api/gov24/service/[id] 응답 */
export type ServiceDetailResult = {
  detail: Record<string, string> | null;
  conditions: {
    ageFrom: string | number | null;
    ageTo: string | number | null;
    flags: { code: string; label: string }[];
    raw: Record<string, string | number | null>;
  };
};

/** 소관기관유형·서비스분야가 비어 있는 서비스를 집계할 때 쓰는 이름 */
export const EMPTY_GROUP_LABEL = '(없음)';
