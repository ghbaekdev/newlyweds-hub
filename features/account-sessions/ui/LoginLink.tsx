'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { loginPath } from '../lib/loginPath';
import { getReturnPath } from '../lib/returnPath';

type LoginLinkProps = { className: string };

export default function LoginLink({ className }: LoginLinkProps) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  return (
    <Link
      href={loginPath(getReturnPath(query ? `${pathname}?${query}` : pathname))}
      className={className}
      aria-current={pathname === '/login' ? 'page' : undefined}
      prefetch={false}
    >
      로그인
    </Link>
  );
}
