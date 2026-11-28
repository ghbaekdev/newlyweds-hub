import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

export async function getAccountProfile(
  userId: string,
): Promise<{ display_name: string | null } | null> {
  const client = await getRequestAuthClient();
  if (!client) throw new Error('표시 이름을 불러올 수 없습니다.');

  const { data, error } = await client
    .from('account_profiles')
    .select('display_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('표시 이름을 불러올 수 없습니다.');
  return data;
}
