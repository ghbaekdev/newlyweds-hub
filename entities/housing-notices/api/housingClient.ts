import 'server-only';

import { DataGoKrError, serviceKey } from '@/shared/lib/api/dataGoKr';

/*
 * 주택 공고 API
 * - 한국부동산원 청약홈 분양정보 (data.go.kr 15098547)          → api.odcloud.kr ApplyhomeInfoDetailSvc
 * - 한국부동산원 청약홈 경쟁률·특별공급 신청현황 (15098905)      → api.odcloud.kr ApplyhomeInfoCmpetRtSvc
 * - 국토교통부 마이홈포털 공공주택 모집공고 (15108420)           → apis.data.go.kr/1613000/HWSPR02
 */

const ODCLOUD = 'https://api.odcloud.kr/api';
const MYHOME = 'https://apis.data.go.kr/1613000/HWSPR02';

export type Row = Record<string, string | number | null>;

async function getJson(url: string, params: Record<string, string | number>) {
  const qs = new URLSearchParams({ serviceKey: serviceKey() });
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  let res: Response;
  let text = '';
  // odcloud는 짧은 시간에 몰리면 429(code -10)를 준다 → 잠깐 쉬고 재시도
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`${url}?${qs}`, { cache: 'no-store' });
    text = await res.text();
    if (res.status !== 429 || attempt >= 4) break;
    await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
  }
  if (!res.ok || text.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
    throw new DataGoKrError(
      `${url.split('/').slice(-2).join('/')}: ${res.status} ${text.slice(0, 160)}`,
      502,
    );
  }
  return JSON.parse(text);
}

/** odcloud(청약홈) 목록 전체 페이지 */
export async function odcloudAll(endpoint: string, cond: Record<string, string>): Promise<Row[]> {
  const out: Row[] = [];
  for (let page = 1; ; page++) {
    const j = await getJson(`${ODCLOUD}/${endpoint}`, { page, perPage: 500, ...cond });
    out.push(...j.data);
    if (out.length >= j.matchCount || j.data.length === 0) return out;
  }
}

/** 마이홈 목록 전체 페이지 */
export async function myhomeAll(op: string, params: Record<string, string>): Promise<Row[]> {
  const out: Row[] = [];
  for (let pageNo = 1; ; pageNo++) {
    const body = (await getJson(`${MYHOME}/${op}`, { ...params, pageNo, numOfRows: 100 })).response
      .body;
    const item = body.item ? (Array.isArray(body.item) ? body.item : [body.item]) : [];
    out.push(...item);
    if (out.length >= Number(body.totalCount) || item.length === 0) return out;
  }
}
