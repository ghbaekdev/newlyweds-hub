import { connection, type NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';

import { createAuthResponse } from '@/features/account-sessions/model/authResponse';
import {
  WithdrawalIssue,
  withdrawalIssuePath,
  withdrawalPath,
} from '@/features/account-withdrawals/lib/withdrawalPaths';
import {
  signWithdrawalToken,
  verifyWithdrawalToken,
  WithdrawalTokenKind,
  withdrawalTokenLifetime,
} from '@/features/account-withdrawals/lib/withdrawalToken';
import {
  getKakaoReauthenticationConfig,
  verifyKakaoReauthentication,
} from '@/features/account-withdrawals/model/kakaoReauthentication';
import {
  withdrawalCookieOptions,
  withdrawalFlowCookie,
  withdrawalReceiptCookie,
  withdrawalReceiptLifetime,
} from '@/features/account-withdrawals/model/withdrawalCookies';

import { getWithdrawalSession } from '@/entities/account-withdrawals/api/getWithdrawalSession';

export async function GET(request: NextRequest) {
  await connection();
  const config = getKakaoReauthenticationConfig();
  const secure = config?.site.protocol === 'https:';
  const { response, redirect } = createAuthResponse(request, secure);
  const failure = withdrawalIssuePath(WithdrawalIssue.VERIFICATION_FAILED);
  if (!config) return redirect(failure);

  const account = await getWithdrawalSession();
  if (!account) return redirect('/login');

  const params = request.nextUrl.searchParams;
  const challenge = await verifyWithdrawalToken(
    request.cookies.get(withdrawalFlowCookie)?.value,
    account,
    config.signingKey,
  );
  if (
    challenge?.kind !== WithdrawalTokenKind.CHALLENGE ||
    params.get('state') !== challenge.state
  ) {
    return redirect(withdrawalIssuePath(WithdrawalIssue.EXPIRED));
  }

  response.cookies.set(withdrawalFlowCookie, '', withdrawalCookieOptions(secure, 0));
  if (params.get('error') === 'access_denied') {
    return redirect(withdrawalIssuePath(WithdrawalIssue.CANCELLED));
  }

  const code = params.get('code');
  if (!code || params.has('error')) return redirect(failure);

  try {
    const kakaoId = await verifyKakaoReauthentication(config, code, challenge);
    if (!kakaoId) return redirect(failure);
    if (kakaoId !== account.kakaoId) {
      return redirect(withdrawalIssuePath(WithdrawalIssue.ACCOUNT_MISMATCH));
    }

    const receipt = randomBytes(32).toString('base64url');
    response.cookies.set(
      withdrawalFlowCookie,
      await signWithdrawalToken(
        { kind: WithdrawalTokenKind.PROOF, receipt },
        account,
        config.signingKey,
      ),
      withdrawalCookieOptions(secure, withdrawalTokenLifetime),
    );
    response.cookies.set(
      withdrawalReceiptCookie,
      receipt,
      withdrawalCookieOptions(secure, withdrawalReceiptLifetime),
    );
    return redirect(withdrawalPath);
  } catch {
    return redirect(failure);
  }
}
