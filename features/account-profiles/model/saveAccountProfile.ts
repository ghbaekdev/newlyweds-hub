'use server';

import { revalidatePath } from 'next/cache';

import { upsertAccountProfile } from '@/entities/account-profiles/api/upsertAccountProfile';
import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';

import { parseDisplayName } from '../lib/parseDisplayName';
import { type AccountProfileSaveState, SaveAccountProfileState } from './saveAccountProfileState';

export async function saveAccountProfile(
  _previousState: AccountProfileSaveState,
  formData: FormData,
): Promise<AccountProfileSaveState> {
  const values = formData.getAll('displayName');
  const displayName = parseDisplayName(values.length === 1 ? values[0] : null);
  if (!displayName.ok) return SaveAccountProfileState.INVALID;

  try {
    const account = await getCurrentAccount();
    if (!account) return SaveAccountProfileState.SIGN_IN_REQUIRED;

    await upsertAccountProfile(account.id, displayName.value);
  } catch {
    return SaveAccountProfileState.FAILED;
  }

  revalidatePath('/my-page');
  return SaveAccountProfileState.SAVED;
}
