import { createHash } from 'node:crypto';
import 'server-only';

import { createWithdrawalAdminClient } from '@/shared/lib/supabase/createWithdrawalAdminClient';

type WithdrawalAccount = { id: string; sessionId: string; kakaoId: string };

export async function requestAccountWithdrawal(account: WithdrawalAccount, receipt: string) {
  const client = createWithdrawalAdminClient();
  const result = await client?.rpc('request_account_withdrawal', {
    target_user_id: account.id,
    target_session_id: account.sessionId,
    target_provider_id: account.kakaoId,
    receipt_hash: createHash('sha256').update(receipt).digest('hex'),
  });
  if (result?.error) return null;
  return result?.data === 'pending' || result?.data === 'completed' ? result.data : null;
}
