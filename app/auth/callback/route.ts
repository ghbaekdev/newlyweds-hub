import type { NextRequest } from 'next/server';

import { AuthIssue, loginPath } from '@/features/account-sessions/lib/loginPath';
import { getReturnPath } from '@/features/account-sessions/lib/returnPath';
import {
  createAuthResponse,
  returnPathCookie,
} from '@/features/account-sessions/model/authResponse';
import { getAuthSiteUrl } from '@/features/account-sessions/model/authSiteUrl';
import { withdrawalStatusPath } from '@/features/account-withdrawals/lib/withdrawalPaths';

export async function GET(request: NextRequest) {
  const site = getAuthSiteUrl();
  const secure = site?.protocol === 'https:';
  const { response, redirect, client } = createAuthResponse(request, secure);
  const pending = request.cookies.get(returnPathCookie)?.value;
  const next = getReturnPath(pending);
  const params = request.nextUrl.searchParams;
  const code = params.get('code');

  function retry(issue: typeof AuthIssue.CANCELLED | typeof AuthIssue.LOGIN_FAILED) {
    // GoTrue may also send errors in the fragment. An empty fragment replaces it.
    return redirect(`${loginPath(next, issue)}#`);
  }

  if (pending && params.get('error') === 'access_denied' && !params.has('error_code')) {
    return retry(AuthIssue.CANCELLED);
  }
  if (!site || !pending || !code || params.has('error')) return retry(AuthIssue.LOGIN_FAILED);

  try {
    const supabase = client();
    if (!supabase) return retry(AuthIssue.LOGIN_FAILED);
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (result?.data.session && !result.error) {
      response.cookies.set(returnPathCookie, '', { path: '/auth/callback', maxAge: 0, secure });
      const { data: withdrawalPending } = await supabase.rpc('is_account_withdrawal_pending');
      return redirect(withdrawalPending === true ? withdrawalStatusPath : next);
    }
  } catch {
    return retry(AuthIssue.LOGIN_FAILED);
  }

  return retry(AuthIssue.LOGIN_FAILED);
}
