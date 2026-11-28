import Link from 'next/link';
import { Suspense } from 'react';

import { accountPath } from '@/features/account-sessions/lib/returnPath';
import LoginLink from '@/features/account-sessions/ui/LoginLink';

import { getCurrentAccount } from '@/entities/accounts/api/getCurrentAccount';

import NavigationLink from './NavigationLink';

const links = [
  { href: '/', label: '메인' },
  { href: '/housing', label: '주택 공고' },
  { href: '/benefits', label: '지원 혜택' },
] as const;

const linkClass =
  'text-hub-muted hover:text-hub-accent aria-[current]:bg-hub-soft aria-[current]:text-hub-accent flex min-h-11 items-center rounded-t-md px-2 text-sm font-semibold sm:rounded-md sm:px-3.5';

export default function SiteNavigation() {
  return (
    <header className="border-hub-line text-hub-ink border-b bg-white">
      <div className="hub-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-2 sm:min-h-[4.5rem] sm:pt-0">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-bold tracking-tight">
          <svg aria-hidden="true" className="size-8 shrink-0" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" className="fill-hub-accent" />
            <path
              d="M6.5 15.5 16 7l9.5 8.5"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="11.5" cy="21" r="3" fill="white" />
            <circle cx="20.5" cy="21" r="3" fill="white" />
          </svg>
          신혼부부 지원 허브
        </Link>
        <nav aria-label="공통 내비게이션" className="flex w-full flex-wrap gap-x-1 sm:w-auto">
          {links.map(({ href, label }) => (
            <NavigationLink key={href} href={href} label={label} className={linkClass} />
          ))}
          <Suspense fallback={null}>
            <AccountNavigation />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function AccountNavigation() {
  const account = await getCurrentAccount();
  return account ? (
    <NavigationLink href={accountPath} label="마이페이지" className={linkClass} prefetch={false} />
  ) : (
    <LoginLink className={linkClass} />
  );
}
