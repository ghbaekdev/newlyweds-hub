import type { NextRequest } from 'next/server';

import { createAuthResponse } from '@/features/account-sessions/model/authResponse';
import {
  WithdrawalIssue,
  withdrawalIssuePath,
  withdrawalStatusPath,
} from '@/features/account-withdrawals/lib/withdrawalPaths';
import {
  verifyWithdrawalToken,
  withdrawalSecretPattern,
  WithdrawalTokenKind,
} from '@/features/account-withdrawals/lib/withdrawalToken';
import { getKakaoReauthenticationConfig } from '@/features/account-withdrawals/model/kakaoReauthentication';
import {
  withdrawalCookieOptions,
  withdrawalFlowCookie,
  withdrawalReceiptCookie,
  withdrawalReceiptLifetime,
} from '@/features/account-withdrawals/model/withdrawalCookies';

import { getWithdrawalSession } from '@/entities/account-withdrawals/api/getWithdrawalSession';
import { requestAccountWithdrawal } from '@/entities/account-withdrawals/api/requestAccountWithdrawal';

export async function POST(request: NextRequest) {
  const config = getKakaoReauthenticationConfig();
  const secure = config?.site.protocol === 'https:';
  const { response, redirect, client } = createAuthResponse(request, secure);
  const failure = withdrawalIssuePath(WithdrawalIssue.REQUEST_FAILED);
  if (!config || request.headers.get('origin') !== config.site.origin) return redirect(failure);

  const form = await request.formData().catch(() => null);
  const intent = form?.get('intent');
  if (intent === 'cancel') {
    response.cookies.set(withdrawalFlowCookie, '', withdrawalCookieOptions(secure, 0));
    return redirect('/my-page');
  }
  if (intent !== 'confirm') return redirect(failure);

  const account = await getWithdrawalSession();
  if (!account) {
    const receipt = request.cookies.get(withdrawalReceiptCookie)?.value ?? '';
    return redirect(withdrawalSecretPattern.test(receipt) ? withdrawalStatusPath : '/login');
  }

  const proof = await verifyWithdrawalToken(
    request.cookies.get(withdrawalFlowCookie)?.value,
    account,
    config.signingKey,
  );
  if (proof?.kind !== WithdrawalTokenKind.PROOF) {
    return redirect(withdrawalIssuePath(WithdrawalIssue.EXPIRED));
  }

  const status = await requestAccountWithdrawal(account, proof.receipt);
  if (!status) return redirect(failure);

  response.cookies.set(withdrawalFlowCookie, '', withdrawalCookieOptions(secure, 0));
  response.cookies.set(
    withdrawalReceiptCookie,
    proof.receipt,
    withdrawalCookieOptions(secure, withdrawalReceiptLifetime),
  );

  // The durable request already blocked the account even if local sign-out fails.
  await client()
    ?.auth.signOut({ scope: 'local' })
    .catch(() => null);
  return redirect(withdrawalStatusPath);
}
