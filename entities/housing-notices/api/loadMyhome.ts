import 'server-only';

import { MyhomeKind } from '../model/types';
import type { MyhomeItem } from '../model/types';
import { myhomeAll } from './housingClient';
import type { Row } from './housingClient';

const NEWLYWED_RE = /신혼|신생아|예비부부/;

/** 최근 6개월 마이홈 공공임대·공공분양 모집공고 (공고 단위, 최신순) */
export async function loadMyhome(): Promise<MyhomeItem[]> {
  const now = new Date();
  const ym = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const from = ym(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  const params = { yearMtBegin: from, yearMtEnd: ym(now) };
  const [rent, sale] = await Promise.all([
    myhomeAll('rsdtRcritNtcList', params),
    myhomeAll('ltRsdtRcritNtcList', params),
  ]);

  // API는 단지(houseSn)마다 한 줄씩 준다 → 공고 단위로 묶는다
  const group = (rows: Row[], kind: MyhomeKind) => {
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
        supplyType: String(r.suplyTyNm ?? (kind === MyhomeKind.SALE ? '공공분양' : '')),
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
  return [...group(rent, MyhomeKind.RENT), ...group(sale, MyhomeKind.SALE)].sort((a, b) =>
    b.announceDate.localeCompare(a.announceDate),
  );
}
