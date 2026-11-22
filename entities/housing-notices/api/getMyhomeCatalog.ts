import { cacheLife } from 'next/cache';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import 'server-only';

import { createServerSupabase } from '@/shared/lib/supabase/serverClient';

import type { MyhomeCatalog } from '../model/myhomeCatalog';

export async function getMyhomeCatalog(): Promise<MyhomeCatalog | null> {
  'use cache';
  cacheLife('minutes');

  let local: MyhomeCatalog | null = null;
  const dir = process.env.MYHOME_DATA_DIR || '.cache/myhome';
  try {
    local = JSON.parse(await readFile(path.resolve(dir, 'catalog.json'), 'utf8')) as MyhomeCatalog;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return local;
  }

  const { data, error } = await createServerSupabase()
    .from('myhome_catalog')
    .select('snapshot')
    .eq('id', 1)
    .maybeSingle<{ snapshot: MyhomeCatalog }>();

  if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
    if (!local) throw new Error(`마이홈 목록 조회 실패: ${error.message}`);
    console.warn(`마이홈 목록 조회 실패: ${error.code}`);
  }

  const published = data?.snapshot;
  if (local && (!published || local.fetchedAt >= published.fetchedAt)) return local;
  return published ?? null;
}
