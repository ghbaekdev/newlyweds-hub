import type { NextRequest } from 'next/server';

import { createAuthResponse } from '@/features/account-sessions/model/authResponse';
import {
  WithdrawalIssue,
  withdrawalIssuePath,
  withdrawalStatusPath,
} from '@/features/account-withdrawals/lib/withdrawalPaths';
import {
  signWithdrawalToken,
  WithdrawalTokenKind,
  withdrawalTokenLifetime,
} from '@/features/account-withdrawals/lib/withdrawalToken';
import {
  createKakaoReauthentication,
  getKakaoReauthenticationConfig,
} from '@/features/account-withdrawals/model/kakaoReauthentication';
import {
  withdrawalCookieOptions,
  withdrawalFlowCookie,
} from '@/features/account-withdrawals/model/withdrawalCookies';

import { getWithdrawalSession } from '@/entities/account-withdrawals/api/getWithdrawalSession';
import { isWithdrawalPending } from '@/entities/account-withdrawals/api/isWithdrawalPending';

export async function POST(request: NextRequest) {
  const config = getKakaoReauthenticationConfig();
  const secure = config?.site.protocol === 'https:';
  const { response, redirect, client } = createAuthResponse(request, secure);
  const failure = withdrawalIssuePath(WithdrawalIssue.VERIFICATION_FAILED);
  if (
    !config ||
    !process.env.SUPABASE_WITHDRAWAL_SECRET_KEY ||
    request.headers.get('origin') !== config.site.origin
  ) {
    return redirect(failure);
  }

  const account = await getWithdrawalSession();
  if (!account) return redirect('/login');
  if (await isWithdrawalPending()) return redirect(withdrawalStatusPath);
  const active = await client()?.rpc('is_active_service_account');
  if (active?.error || active?.data !== true) return redirect(failure);

  const { url, nonce, state, startedAt } = createKakaoReauthentication(config);
  response.cookies.set(
    withdrawalFlowCookie,
    await signWithdrawalToken(
      { kind: WithdrawalTokenKind.CHALLENGE, nonce, state, startedAt },
      account,
      config.signingKey,
    ),
    withdrawalCookieOptions(secure, withdrawalTokenLifetime),
  );

  return redirect(url.href);
}
