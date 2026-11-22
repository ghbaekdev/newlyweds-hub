import 'server-only';

import { mapLimit } from '../lib/mapLimit';
import { NEWLYWED_TOWN_HOUSE_TYPE } from '../model/types';
import type { ApplyhomeItem } from '../model/types';
import { odcloudAll } from './housingClient';

const num = (v: unknown) => Number(v ?? 0) || 0;

/** since(YYYY-MM-DD) 이후 모집공고된 청약홈 APT 분양 + 주택형별 신혼 특공 세대수·접수건수 */
export async function loadApplyhome(since: string): Promise<ApplyhomeItem[]> {
  const notices = await odcloudAll('ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail', {
    'cond[RCRIT_PBLANC_DE::GTE]': since,
  });
  return mapLimit(notices, 3, async (n) => {
    const cond = { 'cond[PBLANC_NO::EQ]': String(n.PBLANC_NO) };
    const [models, spsply] = await Promise.all([
      odcloudAll('ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancMdl', cond),
      odcloudAll('ApplyhomeInfoCmpetRtSvc/v1/getAPTSpsplyReqstStus', cond),
    ]);
    const isTown = n.HOUSE_SECD_NM === NEWLYWED_TOWN_HOUSE_TYPE;
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
