import 'server-only';

import { gov24Get } from '@/shared/lib/api/gov24Client';

import { AGE_FROM_CODE, AGE_TO_CODE, CONDITION_LABELS } from '../model/constants';
import type { ServiceDetailResult } from '../model/types';

const CONDITION_ON = 'Y';

/** 서비스 하나의 상세(serviceDetail)와 지원조건(supportConditions)을 함께 받는다 */
export async function getServiceDetail(id: string): Promise<ServiceDetailResult> {
  const cond = { page: 1, perPage: 1, 'cond[서비스ID::EQ]': id };
  const [detail, conditions] = await Promise.all([
    gov24Get<Record<string, string>>('serviceDetail', cond),
    gov24Get<Record<string, string | number | null>>('supportConditions', cond),
  ]);

  const raw = conditions.data[0] ?? {};
  const flags = Object.entries(raw)
    .filter(([k, v]) => k in CONDITION_LABELS && v === CONDITION_ON)
    .map(([k]) => ({ code: k, label: CONDITION_LABELS[k] }));

  return {
    detail: detail.data[0] ?? null,
    conditions: {
      ageFrom: raw[AGE_FROM_CODE] ?? null,
      ageTo: raw[AGE_TO_CODE] ?? null,
      flags,
      raw,
    },
  };
}
