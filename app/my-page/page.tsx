import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import MyPageView from '@/views/my-pages/ui/MyPageView';

import { loginPath } from '@/features/account-sessions/lib/loginPath';
import { withdrawalStatusPath } from '@/features/account-withdrawals/lib/withdrawalPaths';

import { getAccountProfile } from '@/entities/account-profiles/api/getAccountProfile';
import { isWithdrawalPending } from '@/entities/account-withdrawals/api/isWithdrawalPending';
import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';
import { getHouseholdProfile } from '@/entities/household-profiles/api/getHouseholdProfile';

export default function AccountPage() {
  return (
    <Suspense fallback={<main className="hub-page" aria-busy="true" />}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const account = await getCurrentAccount();
  if (!account) redirect(loginPath());
  if (await isWithdrawalPending()) redirect(withdrawalStatusPath);

  const [profile, household] = await Promise.allSettled([
    getAccountProfile(account.id),
    getHouseholdProfile(account.id),
  ]);

  return (
    <MyPageView
      displayName={
        profile.status === 'fulfilled' ? (profile.value?.display_name ?? null) : undefined
      }
      household={household.status === 'fulfilled' ? household.value : undefined}
    />
  );
}
