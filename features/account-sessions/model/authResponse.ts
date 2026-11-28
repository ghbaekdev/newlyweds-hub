import { type NextRequest, NextResponse } from 'next/server';

import { createAuthClient } from '@/shared/lib/supabase/createAuthClient';

export const returnPathCookie = 'hub-login-return';

export function createAuthResponse(request: NextRequest, secure: boolean) {
  const response = new NextResponse(null, {
    status: 303,
    headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' },
  });

  function redirect(location: string) {
    response.headers.set('Location', location);
    return response;
  }

  function client() {
    return createAuthClient(
      {
        getAll: () => request.cookies.getAll(),
        setAll(cookies, headers) {
          for (const { name, value, options } of cookies) {
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        },
      },
      secure,
    );
  }

  return { response, redirect, client };
}
