import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

import type { HouseholdProfile } from '../model/types';

export async function upsertHouseholdProfile(userId: string, profile: HouseholdProfile) {
  const supabase = await getRequestAuthClient();
  if (!supabase) throw new Error('가구 조건을 저장할 수 없어요.');

  const { error } = await supabase
    .from('household_profiles')
    .upsert({ ...profile, user_id: userId }, { onConflict: 'user_id' });

  if (error) throw new Error('가구 조건을 저장할 수 없어요.');
}
