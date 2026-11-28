import type { NextRequest } from 'next/server';

import { AuthIssue, loginPath } from '@/features/account-sessions/lib/loginPath';
import { getReturnPath } from '@/features/account-sessions/lib/returnPath';
import {
  createAuthResponse,
  returnPathCookie,
} from '@/features/account-sessions/model/authResponse';
import { getAuthSiteUrl } from '@/features/account-sessions/model/authSiteUrl';

export async function POST(request: NextRequest) {
  const site = getAuthSiteUrl();
  const form = await request.formData().catch(() => null);
  const next = getReturnPath(form?.get('next'));
  const { response, redirect, client } = createAuthResponse(request, site?.protocol === 'https:');
  const failure = loginPath(next, AuthIssue.LOGIN_FAILED);
  if (!site || request.headers.get('origin') !== site.origin || !form) {
    return redirect(failure);
  }

  try {
    const supabase = client();
    if (!supabase) return redirect(failure);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: new URL('/auth/callback', site).href },
    });
    if (error || !data.url) return redirect(failure);

    const authorization = await fetch(data.url, { cache: 'no-store', redirect: 'manual' });
    const kakao = authorization.headers.get('Location');
    if (authorization.status !== 302 || !kakao || !URL.canParse(kakao)) return redirect(failure);

    const target = new URL(kakao);
    if (target.origin !== 'https://kauth.kakao.com' || target.pathname !== '/oauth/authorize') {
      return redirect(failure);
    }

    // Supabase's built-in provider includes account_email in its default scopes.
    // Use the consent items configured in Kakao so an email is never requested by this flow.
    target.searchParams.delete('scope');

    response.cookies.set(returnPathCookie, next, {
      path: '/auth/callback',
      maxAge: 600,
      httpOnly: true,
      sameSite: 'lax',
      secure: site.protocol === 'https:',
    });
    return redirect(target.href);
  } catch {
    return redirect(failure);
  }
}
