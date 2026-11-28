import type { NextRequest } from 'next/server';

import { AuthIssue, loginPath } from '@/features/account-sessions/lib/loginPath';
import { createAuthResponse } from '@/features/account-sessions/model/authResponse';
import { getAuthSiteUrl } from '@/features/account-sessions/model/authSiteUrl';

export async function POST(request: NextRequest) {
  const site = getAuthSiteUrl();
  const { redirect, client } = createAuthResponse(request, site?.protocol === 'https:');
  const failure = loginPath(undefined, AuthIssue.SIGN_OUT_FAILED);
  if (!site || request.headers.get('origin') !== site.origin) return redirect(failure);

  try {
    const result = await client()?.auth.signOut({ scope: 'local' });
    return redirect(result && !result.error ? '/' : failure);
  } catch {
    return redirect(failure);
  }
}
