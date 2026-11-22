import type { MyhomeKind } from './types';

export const MyhomePdfStatus = {
  PENDING: 'pending',
  PARSED: 'parsed',
  FAILED: 'failed',
  MANUAL: 'manual',
  NO_TEXT: 'no_text',
  UNAVAILABLE: 'unavailable',
  CORRECTION_PENDING: 'correction_pending',
  CANCELLED: 'cancelled',
} as const;

export type MyhomePdfStatus = (typeof MyhomePdfStatus)[keyof typeof MyhomePdfStatus];

export const myhomePdfLabels = {
  [MyhomePdfStatus.PENDING]: '공고문 확인 대기',
  [MyhomePdfStatus.PARSED]: 'PDF 확인',
  [MyhomePdfStatus.FAILED]: 'PDF 재확인 예정',
  [MyhomePdfStatus.MANUAL]: '공급기관 원문 확인',
  [MyhomePdfStatus.NO_TEXT]: '이미지 PDF · 원문 확인',
  [MyhomePdfStatus.UNAVAILABLE]: 'PDF 첨부 확인 필요',
  [MyhomePdfStatus.CORRECTION_PENDING]: '정정공고 확인 중',
  [MyhomePdfStatus.CANCELLED]: '취소공고',
} satisfies Record<MyhomePdfStatus, string>;

export type MyhomeCatalogItem = {
  slug: string;
  kind: MyhomeKind;
  title: string;
  supplier: string;
  supplyType: string;
  noticeStatus: string;
  regions: string[];
  announceDate: string | null;
  startsOn: string | null;
  endsOn: string | null;
  officialUrl: string | null;
  pdfStatus: MyhomePdfStatus;
  resolvedOfficialUrl?: string;
  pdfUrl?: string | null;
  pdfHash?: string | null;
  extracted?: { label: string; headers: string[]; rows: string[][]; sourcePage: number }[] | null;
};

export type MyhomeCatalog = {
  fetchedAt: string;
  notices: MyhomeCatalogItem[];
};
