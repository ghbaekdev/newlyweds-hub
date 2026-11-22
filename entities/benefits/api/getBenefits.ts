import { cacheLife, cacheTag } from 'next/cache';
import 'server-only';

import { createServerSupabase } from '@/shared/lib/supabase/serverClient';

import type { Benefit } from '../model/types';

const COLUMNS =
  'service_id,name,org_name,level,sido,sigungu,relevance,category,benefit_type,summary,amount_max_krw,amount_text,' +
  'marriage_max_years,prospective_allowed,age_min,age_max,income_kind,income_max_median_pct,income_max_annual_krw,' +
  'homeless_required,residency_required,residency_scope,residency_min_months,tags,deadline_type,apply_start,apply_end,' +
  'detail_url,eligibility,application,review,stale_suspect,confidence';

/** Supabase의 정규화된 신혼부부 혜택 전체. 자주 바뀌지 않으므로 몇 시간 단위로 캐시한다. */
export async function getBenefits(): Promise<Benefit[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('benefits');

  const { data, error } = await createServerSupabase()
    .from('benefits')
    .select(COLUMNS)
    .order('relevance')
    .order('sido', { nullsFirst: true })
    .order('sigungu', { nullsFirst: true });
  if (error) throw new Error(`Supabase benefits: ${error.message}`);
  return data as unknown as Benefit[];
}
