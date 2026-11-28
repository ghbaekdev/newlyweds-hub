import { createHash } from 'node:crypto';
import 'server-only';

import { createWithdrawalAdminClient } from '@/shared/lib/supabase/createWithdrawalAdminClient';

export async function getAccountWithdrawalStatus(receipt: string) {
  const client = createWithdrawalAdminClient();
  const result = await client?.rpc('get_account_withdrawal_status', {
    receipt_hash: createHash('sha256').update(receipt).digest('hex'),
  });

  if (result?.error) return null;
  return result?.data === 'pending' || result?.data === 'completed' ? result.data : null;
}
