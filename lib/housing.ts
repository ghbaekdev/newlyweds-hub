import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import 'server-only';

import { Gov24Error, serviceKey } from './gov24';

/*
 * 주택 공고 API
 * - 한국부동산원 청약홈 분양정보 (data.go.kr 15098547)          → api.odcloud.kr ApplyhomeInfoDetailSvc
 * - 한국부동산원 청약홈 경쟁률·특별공급 신청현황 (15098905)      → api.odcloud.kr ApplyhomeInfoCmpetRtSvc
 * - 국토교통부 마이홈포털 공공주택 모집공고 (15108420)           → apis.data.go.kr/1613000/HWSPR02
 */

const CACHE_FILE = path.join(process.cwd(), '.cache', 'housing.json');
const ODCLOUD = 'https://api.odcloud.kr/api';
const MYHOME = 'https://apis.data.go.kr/1613000/HWSPR02';

type Row = Record<string, string | number | null>;

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
    throw new Gov24Error(
      `${url.split('/').slice(-2).join('/')}: ${res.status} ${text.slice(0, 160)}`,
      502,
    );
  }
  return JSON.parse(text);
}

async function odcloudAll(endpoint: string, cond: Record<string, string>): Promise<Row[]> {
  const out: Row[] = [];
  for (let page = 1; ; page++) {
    const j = await getJson(`${ODCLOUD}/${endpoint}`, { page, perPage: 500, ...cond });
    out.push(...j.data);
    if (out.length >= j.matchCount || j.data.length === 0) return out;
  }
}

async function myhomeAll(op: string, params: Record<string, string>): Promise<Row[]> {
  const out: Row[] = [];
  for (let pageNo = 1; ; pageNo++) {
    const body = (await getJson(`${MYHOME}/${op}`, { ...params, pageNo, numOfRows: 100 })).response
      .body;
    const item = body.item ? (Array.isArray(body.item) ? body.item : [body.item]) : [];
    out.push(...item);
    if (out.length >= Number(body.totalCount) || item.length === 0) return out;
  }
}

async function mapLimit<T, R>(xs: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(xs.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < xs.length) {
        const idx = i++;
        out[idx] = await fn(xs[idx]);
      }
    }),
  );
  return out;
}

const num = (v: unknown) => Number(v ?? 0) || 0;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const NEWLYWED_RE = /신혼|신생아|예비부부/;

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

export type MyhomeItem = {
  id: string;
  kind: '임대' | '분양';
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

export type HousingSnapshot = {
  fetchedAt: string;
  applyhome: ApplyhomeItem[];
  myhome: MyhomeItem[];
};

async function loadApplyhome(since: string): Promise<ApplyhomeItem[]> {
  const notices = await odcloudAll('ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail', {
    'cond[RCRIT_PBLANC_DE::GTE]': since,
  });
  return mapLimit(notices, 3, async (n) => {
    const cond = { 'cond[PBLANC_NO::EQ]': String(n.PBLANC_NO) };
    const [models, spsply] = await Promise.all([
      odcloudAll('ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancMdl', cond),
      odcloudAll('ApplyhomeInfoCmpetRtSvc/v1/getAPTSpsplyReqstStus', cond),
    ]);
    const isTown = n.HOUSE_SECD_NM === '신혼희망타운';
    const totalUnits = models.reduce((s, m) => s + num(m.SUPLY_HSHLDCO) + num(m.SPSPLY_HSHLDCO), 0);
    // 신혼희망타운은 전 세대가 신혼부부 대상이라 특공 컬럼이 0으로 온다
    const newlywedUnits = isTown
      ? totalUnits
      : models.reduce((s, m) => s + num(m.NWWDS_HSHLDCO), 0);
    const applicants = spsply.length
      ? spsply.reduce(
          (s, r) =>
            s +
            num(r.CRSPAREA_NWWDS_NMTW_CNT) +
            num(r.CTPRVN_NWWDS_NMTW_CNT) +
            num(r.ETC_AREA_NWWDS_NMTW_CNT),
          0,
        )
      : null;
    return {
      id: String(n.PBLANC_NO),
      name: String(n.HOUSE_NM ?? ''),
      houseType: String(n.HOUSE_SECD_NM ?? ''),
      saleType: String(n.HOUSE_DTL_SECD_NM ?? ''),
      region: String(n.SUBSCRPT_AREA_CODE_NM ?? ''),
      address: String(n.HSSPLY_ADRES ?? ''),
      totalUnits,
      newlywedUnits,
      newlywedApplicants: isTown ? null : applicants,
      newlywedRatio:
        !isTown && applicants !== null && newlywedUnits > 0 ? applicants / newlywedUnits : null,
      isNewlywedTown: isTown,
      announceDate: String(n.RCRIT_PBLANC_DE ?? ''),
      specialStart: String(n.SPSPLY_RCEPT_BGNDE ?? ''),
      winnerDate: String(n.PRZWNER_PRESNATN_DE ?? ''),
      url: String(n.PBLANC_URL ?? ''),
    };
  });
}

async function loadMyhome(): Promise<MyhomeItem[]> {
  const now = new Date();
  const ym = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const from = ym(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  const params = { yearMtBegin: from, yearMtEnd: ym(now) };
  const [rent, sale] = await Promise.all([
    myhomeAll('rsdtRcritNtcList', params),
    myhomeAll('ltRsdtRcritNtcList', params),
  ]);

  // API는 단지(houseSn)마다 한 줄씩 준다 → 공고 단위로 묶는다
  const group = (rows: Row[], kind: '임대' | '분양') => {
    const m = new Map<string, Row[]>();
    for (const r of rows) {
      const id = String(r.pblancId);
      m.set(id, [...(m.get(id) ?? []), r]);
    }
    return [...m.entries()].map(([id, rs]): MyhomeItem => {
      const r = rs[0];
      return {
        id: `${kind}-${id}`,
        kind,
        name: String(r.pblancNm ?? ''),
        status: String(r.sttusNm ?? ''),
        supplier: String(r.suplyInsttNm ?? ''),
        supplyType: String(r.suplyTyNm ?? (kind === '분양' ? '공공분양' : '')),
        houseType: String(r.houseTyNm ?? ''),
        regions: [...new Set(rs.map((x) => `${x.brtcNm ?? ''} ${x.signguNm ?? ''}`.trim()))],
        complexes: rs.length,
        announceDate: String(r.rcritPblancDe ?? ''),
        beginDate: String(r.beginDe ?? ''),
        endDate: String(r.endDe ?? ''),
        url: String(r.url ?? r.pcUrl ?? ''),
        newlyweds: NEWLYWED_RE.test(String(r.pblancNm ?? '')),
      };
    });
  };
  return [...group(rent, '임대'), ...group(sale, '분양')].sort((a, b) =>
    b.announceDate.localeCompare(a.announceDate),
  );
}

let memo: HousingSnapshot | null = null;

export async function loadHousing(refresh = false): Promise<HousingSnapshot> {
  if (!refresh) {
    if (memo) return memo;
    try {
      memo = JSON.parse(await readFile(CACHE_FILE, 'utf8')) as HousingSnapshot;
      return memo;
    } catch {}
  }
  const since = ymd(new Date(Date.now() - 90 * 86400_000));
  const [applyhome, myhome] = await Promise.all([loadApplyhome(since), loadMyhome()]);
  applyhome.sort((a, b) => b.announceDate.localeCompare(a.announceDate));
  memo = { fetchedAt: new Date().toISOString(), applyhome, myhome };
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(memo));
  return memo;
}
