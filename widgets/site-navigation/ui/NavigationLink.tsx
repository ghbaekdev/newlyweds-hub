'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavigationLinkProps = {
  href: string;
  label: string;
  className: string;
  prefetch?: false;
};

export default function NavigationLink({ href, label, className, prefetch }: NavigationLinkProps) {
  const pathname = usePathname();
  const current = pathname === href;
  const active = href !== '/' && pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={current ? 'page' : active ? 'location' : undefined}
      className={className}
    >
      {label}
    </Link>
  );
}
