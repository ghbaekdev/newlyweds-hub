import { type CookieMethodsServer, createServerClient } from '@supabase/ssr';
import 'server-only';

export function createAuthClient(cookies: CookieMethodsServer, secure: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies,
    cookieOptions: { path: '/', httpOnly: true, sameSite: 'lax', secure },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}
