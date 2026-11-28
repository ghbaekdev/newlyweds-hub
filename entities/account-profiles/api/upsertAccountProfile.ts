import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

export async function upsertAccountProfile(userId: string, displayName: string | null) {
  const client = await getRequestAuthClient();
  if (!client) throw new Error('표시 이름을 저장할 수 없습니다.');

  const { error } = await client
    .from('account_profiles')
    .upsert({ user_id: userId, display_name: displayName }, { onConflict: 'user_id' });

  if (error) throw new Error('표시 이름을 저장할 수 없습니다.');
}
