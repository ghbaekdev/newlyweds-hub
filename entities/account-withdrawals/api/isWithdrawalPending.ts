import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

export async function isWithdrawalPending() {
  const client = await getRequestAuthClient();
  const result = await client?.rpc('is_account_withdrawal_pending');
  return !result?.error && result?.data === true;
}
