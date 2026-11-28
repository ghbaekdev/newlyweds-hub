import { cookies } from 'next/headers';
import 'server-only';

import { createAuthClient } from './createAuthClient';

export async function getRequestAuthClient() {
  const store = await cookies();
  // The proxy persists any refreshed session before the server reads these cookies.
  return createAuthClient({ getAll: () => store.getAll() }, false);
}
