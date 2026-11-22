'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '메인' },
  { href: '/housing', label: '주택 공고' },
  { href: '/benefits', label: '지원 혜택' },
] as const;

export default function SiteNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-hub-line text-hub-ink border-b bg-white">
      <div className="hub-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-2 sm:min-h-[4.5rem] sm:pt-0">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="bg-hub-accent grid size-8 place-items-center rounded-md text-xl leading-none text-white"
          >
            ⌂
          </span>
          신혼부부 지원 허브
        </Link>
        <nav aria-label="공통 내비게이션" className="flex w-full gap-1 sm:w-auto">
          {links.map(({ href, label }) => {
            const current = pathname === href;
            const active = current || (href !== '/' && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : active ? 'location' : undefined}
                className="text-hub-muted hover:text-hub-accent aria-[current]:bg-hub-soft aria-[current]:text-hub-accent flex min-h-11 items-center rounded-t-md px-3.5 text-sm font-semibold sm:rounded-md"
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
