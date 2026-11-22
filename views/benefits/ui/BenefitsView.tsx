import Link from 'next/link';

import BenefitsBrowser from '@/features/benefit-filters/ui/BenefitsBrowser';

import type { Benefit } from '@/entities/benefits/model/types';

type Props = { benefits: Benefit[]; regions: Record<string, string[]> };

export default function BenefitsView({ benefits, regions }: Props) {
  return (
    <main className="hub-page">
      <div className="hub-container pt-8 pb-14 sm:pt-10">
        <header className="mb-5 sm:mb-7">
          <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">신혼부부 혜택 찾기</h1>
          <p className="text-hub-muted mt-2">
            거주 지역과 혼인 상태에 따라 주거비·결혼·건강 지원을 찾아보세요.
          </p>
          <Link
            href="/benefits/raw"
            className="text-hub-accent inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
          >
            보조금24 원본 탐색{' '}
            <span aria-hidden="true" className="ml-1">
              →
            </span>
          </Link>
        </header>
        <BenefitsBrowser benefits={benefits} regions={regions} />
      </div>
    </main>
  );
}
