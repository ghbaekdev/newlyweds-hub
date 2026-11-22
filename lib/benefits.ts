import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import 'server-only';

export type Scope = 'both' | 'either' | 'applicant' | null;

export type Benefit = {
  service_id: string;
  name: string;
  org_name: string | null;
  level: 'national' | 'sido' | 'sigungu' | 'other';
  sido: string | null;
  sigungu: string | null;
  relevance: 'core' | 'includes' | 'incidental';
  category: string;
  benefit_type: string;
  summary: string | null;
  amount_max_krw: number | null;
  amount_text: string | null;
  marriage_max_years: number | null;
  prospective_allowed: boolean;
  age_min: number | null;
  age_max: number | null;
  income_kind: 'median_pct' | 'annual_krw' | 'none' | 'other' | null;
  income_max_median_pct: number | null;
  income_max_annual_krw: number | null;
  homeless_required: boolean | null;
  residency_required: boolean | null;
  residency_scope: Scope;
  residency_min_months: number | null;
  tags: string[];
  deadline_type: 'always' | 'period' | 'annual' | 'budget' | 'varies' | 'unknown' | null;
  apply_start: string | null;
  apply_end: string | null;
  detail_url: string | null;
  eligibility: {
    residency?: { text?: string | null };
    marriage?: { basis?: string | null; prospective_text?: string | null };
    age?: { scope?: Scope };
    income?: { basis?: string | null; text?: string | null };
    housing_limits?: string | null;
    other?: string[];
  };
  application: { text?: string | null; method?: string | null; online_url?: string | null };
  review: { notes?: string | null };
  stale_suspect: boolean;
  confidence: 'high' | 'medium' | 'low' | null;
};

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 필요합니다.',
    );

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db
    .from('benefits')
    .select(COLUMNS)
    .order('relevance')
    .order('sido', { nullsFirst: true })
    .order('sigungu', { nullsFirst: true });
  if (error) throw new Error(`Supabase benefits: ${error.message}`);
  return data as unknown as Benefit[];
}
