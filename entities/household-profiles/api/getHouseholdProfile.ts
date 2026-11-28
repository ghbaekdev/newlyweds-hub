import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

import type { HouseholdProfile } from '../model/types';

export async function getHouseholdProfile(userId: string): Promise<HouseholdProfile | null> {
  const supabase = await getRequestAuthClient();
  if (!supabase) throw new Error('가구 조건을 조회할 수 없어요.');

  const { data, error } = await supabase
    .from('household_profiles')
    .select(
      'desired_regions, applicant_monthly_income_krw, partner_monthly_income_krw, applicant_home_ownership, partner_home_ownership, applicant_residence_province, applicant_residence_district, applicant_residence_since, partner_residence_province, partner_residence_district, partner_residence_since, marriage_status, marriage_registered_on, household_size',
    )
    .eq('user_id', userId)
    .maybeSingle<HouseholdProfile>();

  if (error) throw new Error('가구 조건을 조회할 수 없어요.');
  return data;
}
