import Link from 'next/link';

import HousingNoticeList from '@/features/housing-filters/ui/HousingNoticeList';

import type { MyhomeNoticeSummary } from '@/entities/housing-notices/model/myhomeNoticeDetails';

type Props = { notices: MyhomeNoticeSummary[]; fetchedAt?: string };

export default function HousingNoticesView({ notices, fetchedAt }: Props) {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#173129]">
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-16 sm:px-10 sm:pt-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#cdd8ce] pb-5 text-sm">
          <Link href="/" className="font-bold tracking-tight hover:underline">
            신혼부부 주거·혜택
          </Link>
          <Link href="/benefits" className="text-[#37574b] underline-offset-4 hover:underline">
            혜택 찾기 <span aria-hidden="true">↗</span>
          </Link>
        </header>
        <section className="pt-12 pb-10 sm:pt-16 sm:pb-12" aria-labelledby="housing-heading">
          <h1 id="housing-heading" className="text-4xl font-bold tracking-[-0.055em] sm:text-6xl">
            마이홈 주택 공고
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#425d51] sm:text-lg">
            공공임대와 공공분양의 접수 일정 및 공급기관 원문을 확인하세요.
          </p>
        </section>
        {fetchedAt && (
          <p className="mb-3 text-sm text-[#425d51]">
            수집 일자{' '}
            {new Intl.DateTimeFormat('ko-KR', {
              dateStyle: 'medium',
              timeZone: 'Asia/Seoul',
            }).format(new Date(fetchedAt))}
          </p>
        )}
        <HousingNoticeList notices={notices} />
      </div>
    </main>
  );
}
