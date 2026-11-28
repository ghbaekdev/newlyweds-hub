import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import LoginView from '@/views/logins/ui/LoginView';

import { AuthIssue } from '@/features/account-sessions/lib/loginPath';
import { accountPath, getReturnPath } from '@/features/account-sessions/lib/returnPath';

import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';

export const metadata: Metadata = { title: '로그인', robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <Suspense fallback={<main className="hub-page" aria-busy="true" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<'/login'>, 'searchParams'>) {
  const { next: requested, error } = await searchParams;
  if (error !== AuthIssue.SIGN_OUT_FAILED && (await getCurrentAccount())) redirect(accountPath);

  return <LoginView next={getReturnPath(requested)} issue={error} />;
}
