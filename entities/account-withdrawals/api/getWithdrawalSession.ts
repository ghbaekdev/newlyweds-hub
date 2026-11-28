import 'server-only';

import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

export async function getWithdrawalSession() {
  const account = await getCurrentAccount();
  if (!account) return null;

  const client = await getRequestAuthClient();
  const result = await client?.auth.getClaims();
  const claims = result?.data?.claims;

  if (result?.error || claims?.sub !== account.id || typeof claims.session_id !== 'string') {
    return null;
  }

  return { ...account, sessionId: claims.session_id };
}
