import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import WithdrawalView from '@/views/account-withdrawals/ui/WithdrawalView';

import { loginPath } from '@/features/account-sessions/lib/loginPath';
import { withdrawalStatusPath } from '@/features/account-withdrawals/lib/withdrawalPaths';
import {
  verifyWithdrawalToken,
  WithdrawalTokenKind,
} from '@/features/account-withdrawals/lib/withdrawalToken';
import { getKakaoReauthenticationConfig } from '@/features/account-withdrawals/model/kakaoReauthentication';
import { withdrawalFlowCookie } from '@/features/account-withdrawals/model/withdrawalCookies';

import { getWithdrawalSession } from '@/entities/account-withdrawals/api/getWithdrawalSession';
import { isWithdrawalPending } from '@/entities/account-withdrawals/api/isWithdrawalPending';

export default function WithdrawalPage({ searchParams }: PageProps<'/my-page/withdrawal'>) {
  return (
    <Suspense fallback={<main className="hub-page" aria-busy="true" />}>
      <WithdrawalContent searchParams={searchParams} />
    </Suspense>
  );
}

async function WithdrawalContent({
  searchParams,
}: Pick<PageProps<'/my-page/withdrawal'>, 'searchParams'>) {
  const account = await getWithdrawalSession();
  if (!account) redirect(loginPath());
  if (await isWithdrawalPending()) redirect(withdrawalStatusPath);

  const config = getKakaoReauthenticationConfig();
  const store = await cookies();
  const token = config
    ? await verifyWithdrawalToken(
        store.get(withdrawalFlowCookie)?.value,
        account,
        config.signingKey,
      )
    : null;
  const { error } = await searchParams;
  return (
    <WithdrawalView
      available={Boolean(config && process.env.SUPABASE_WITHDRAWAL_SECRET_KEY)}
      verified={token?.kind === WithdrawalTokenKind.PROOF}
      issue={typeof error === 'string' ? error : undefined}
    />
  );
}
