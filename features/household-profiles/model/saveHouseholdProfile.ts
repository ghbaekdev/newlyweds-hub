'use server';

import regions from '@/data/regions.json';
import { revalidatePath } from 'next/cache';

import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';
import { upsertHouseholdProfile } from '@/entities/household-profiles/api/upsertHouseholdProfile';

import { parseHouseholdProfile } from '../lib/parseHouseholdProfile';

type SaveResult = { message: string; saved: boolean };

export async function saveHouseholdProfile(
  _previous: SaveResult,
  form: FormData,
): Promise<SaveResult> {
  try {
    const account = await getCurrentAccount();
    if (!account) return { saved: false, message: '다시 로그인한 후 저장해 주세요.' };

    const parsed = parseHouseholdProfile(form, regions);
    if (parsed.error !== null) return { saved: false, message: parsed.error };

    await upsertHouseholdProfile(account.id, parsed.data);
  } catch {
    return { saved: false, message: '가구 조건을 저장하지 못했어요. 다시 시도해 주세요.' };
  }

  revalidatePath('/my-page');
  return { saved: true, message: '가구 조건을 저장했어요.' };
}
