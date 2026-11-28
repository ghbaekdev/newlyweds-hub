import type { ReactNode } from 'react';

import Card from '@/shared/ui/Card';
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/Collapsible';

type Props = { children: ReactNode; hasConditions: boolean };

export default function FilterPanel({ children, hasConditions }: Props) {
  return (
    <Collapsible asChild>
      <Card className="border-hub-line min-w-0 self-start rounded-xl border bg-white">
        <h2 className="hidden px-4 pt-4 font-bold md:block">검색 조건</h2>
        <CollapsibleTrigger className="group flex min-h-12 w-full cursor-pointer items-center justify-between px-4 font-bold md:hidden">
          <span>
            검색 조건
            {hasConditions && <span className="text-hub-accent ml-2 text-sm">적용 중</span>}
          </span>
          <span aria-hidden="true" className="text-hub-accent group-data-[state=open]:hidden">
            +
          </span>
          <span
            aria-hidden="true"
            className="text-hub-accent hidden group-data-[state=open]:inline"
          >
            −
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent
          forceMount
          className="px-4 pb-4 data-[state=closed]:hidden md:pt-3 md:data-[state=closed]:block"
        >
          {children}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
