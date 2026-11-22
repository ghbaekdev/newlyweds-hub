'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; hasConditions: boolean };

export default function FilterPanel({ children, hasConditions }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-hub-line min-w-0 self-start rounded-xl border bg-white">
      <h2 className="hidden px-4 pt-4 font-bold md:block">검색 조건</h2>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-controls={id}
        aria-expanded={open}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between px-4 font-bold md:hidden"
      >
        <span>
          검색 조건{hasConditions && <span className="text-hub-accent ml-2 text-sm">적용 중</span>}
        </span>
        <span aria-hidden="true" className="text-hub-accent">
          {open ? '−' : '+'}
        </span>
      </button>
      <div id={id} className={`${open ? 'block' : 'hidden'} px-4 pb-4 md:block md:pt-3`}>
        {children}
      </div>
    </div>
  );
}
