import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { Suspense } from 'react';

import WithdrawalStatusView from '@/views/account-withdrawals/ui/WithdrawalStatusView';

import { withdrawalSecretPattern } from '@/features/account-withdrawals/lib/withdrawalToken';
import { withdrawalReceiptCookie } from '@/features/account-withdrawals/model/withdrawalCookies';

import { getAccountWithdrawalStatus } from '@/entities/account-withdrawals/api/getAccountWithdrawalStatus';
import { isWithdrawalPending } from '@/entities/account-withdrawals/api/isWithdrawalPending';
import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';

export const metadata: Metadata = { title: '탈퇴 상태 확인', robots: { index: false } };

export default function WithdrawalStatusPage() {
  return (
    <Suspense fallback={<main className="hub-page" aria-busy="true" />}>
      <WithdrawalStatusContent />
    </Suspense>
  );
}

async function WithdrawalStatusContent() {
  await connection();
  const store = await cookies();
  const receipt = store.get(withdrawalReceiptCookie)?.value ?? '';
  const status = withdrawalSecretPattern.test(receipt)
    ? await getAccountWithdrawalStatus(receipt)
    : null;

  if (status) return <WithdrawalStatusView status={status} />;

  const pending = (await getCurrentAccount()) && (await isWithdrawalPending());
  return <WithdrawalStatusView status={pending ? 'pending' : 'unavailable'} />;
}
