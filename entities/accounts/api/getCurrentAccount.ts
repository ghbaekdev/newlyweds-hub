import { connection } from 'next/server';
import { cache } from 'react';
import 'server-only';

import { getRequestAuthClient } from '@/shared/lib/supabase/getRequestAuthClient';

export const getCurrentAccount = cache(async function getCurrentAccount() {
  // Supabase checks token expiry at request time.
  await connection();
  const supabase = await getRequestAuthClient();
  const result = await supabase?.auth.getUser();
  const user = result?.data.user;
  if (result?.error || user?.identities?.length !== 1 || user.identities[0].provider !== 'kakao') {
    return null;
  }

  return { id: user.id, kakaoId: user.identities[0].id };
});
