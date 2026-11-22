import { createClient } from '@supabase/supabase-js';
import 'server-only';

/** 공개(publishable) 키로 읽기 전용 접근하는 서버용 Supabase 클라이언트 */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 필요합니다.',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
