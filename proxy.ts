import { type NextRequest, NextResponse } from 'next/server';

import { getAuthSiteUrl } from '@/features/account-sessions/model/authSiteUrl';

import { createAuthClient } from '@/shared/lib/supabase/createAuthClient';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createAuthClient(
    {
      getAll: () => request.cookies.getAll(),
      setAll(cookies, headers) {
        for (const { name, value } of cookies) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
    getAuthSiteUrl()?.protocol === 'https:',
  );

  await supabase?.auth.getClaims();
  return response;
}

export const config = {
  matcher: ['/', '/benefits/:path*', '/housing/:path*', '/login', '/my-page/:path*'],
};
