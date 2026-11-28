import Link from 'next/link';

import HousingNoticeSelection from '@/widgets/housing-notice-details/ui/HousingNoticeSelection';

import type { MyhomeNoticeDetail } from '@/entities/housing-notices/model/myhomeNoticeDetails';
import { MyhomeKind } from '@/entities/housing-notices/model/types';

import Button from '@/shared/ui/Button';

type Props = { notice: MyhomeNoticeDetail };

export default function HousingNoticeDetailView({ notice }: Props) {
  const {
    applicationPeriods,
    eligibility,
    eligibilityAsOf,
    location,
    kind,
    title,
    reviewNote,
    source,
    supply,
  } = notice;

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-[#173129]">
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-16 sm:px-10 sm:pt-8">
        <header className="border-b border-[#cdd8ce] pb-5">
          <Link href="/housing" className="text-sm font-bold underline-offset-4 hover:underline">
            <span aria-hidden="true">← </span>공고 목록
          </Link>
        </header>
        <div className="pt-10 pb-8 sm:pt-14 sm:pb-10">
          <p className="text-sm font-semibold text-[#37574b]">
            {kind === MyhomeKind.RENT ? '공공임대' : '공공분양'} · {location}
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl leading-tight font-bold tracking-[-0.045em] sm:text-5xl">
            {title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
            <Button asChild>
              <a
                href={source.supplierNoticeUrl}
                className="hover:bg-housing-button-hover rounded-md bg-[#214838] px-4 py-2.5 text-white"
              >
                LH 공식 공고 보기 <span aria-hidden="true">↗</span>
              </a>
            </Button>
            <Button asChild>
              <a
                href={source.pdfUrl}
                className="rounded-md border border-[#a7b8ac] px-4 py-2.5 hover:bg-white"
              >
                모집공고 PDF <span aria-hidden="true">↗</span>
              </a>
            </Button>
          </div>
        </div>
        {reviewNote && (
          <p className="mb-6 border-l-4 border-[#b4772a] bg-[#fff3df] px-4 py-3 text-sm leading-6 text-[#623b10]">
            {reviewNote}
          </p>
        )}
        <div className="space-y-8">
          <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="schedule">
            <h2 id="schedule" className="text-2xl font-bold tracking-tight">
              접수 일정
            </h2>
            <dl className="mt-3 divide-y divide-[#d8e0d6]">
              {applicationPeriods.map((period) => (
                <div
                  key={period.group}
                  className="grid gap-1 py-3 text-sm sm:grid-cols-[14rem_minmax(0,1fr)]"
                >
                  <dt className="font-semibold">{period.group}</dt>
                  <dd className="text-[#425d51]">
                    {period.opensOn} {period.opensAt} ~ {period.closesOn} {period.closesAt}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={`${source.pdfUrl}#page=${applicationPeriods[0].sourcePage}`}
              className="text-sm text-[#37574b] underline underline-offset-4"
            >
              일정 근거 · 원문 {applicationPeriods[0].sourcePage}쪽
            </a>
          </section>
          {supply && (
            <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="supply">
              <h2 id="supply" className="text-2xl font-bold tracking-tight">
                공급 규모
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#425d51]">
                전용면적 {supply.exclusiveAreaSquareMeters}㎡ · 공공분양{' '}
                {supply.publicSaleUnitsIncludingAdvanceApplicants}세대 (사전청약 포함)
              </p>
            </section>
          )}
          <section className="border-t border-[#cdd8ce] pt-6" aria-labelledby="eligibility">
            <h2 id="eligibility" className="text-2xl font-bold tracking-tight">
              신청 자격
            </h2>
            <p className="mt-3 text-sm font-semibold">판정 기준일 {eligibilityAsOf}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#425d51]">{eligibility.summary}</p>
            <a
              href={`${source.pdfUrl}#page=${eligibility.sourcePage}`}
              className="mt-2 inline-block text-sm text-[#37574b] underline underline-offset-4"
            >
              자격 근거 · 원문 {eligibility.sourcePage}쪽
            </a>
          </section>
          <HousingNoticeSelection notice={notice} />
        </div>
      </div>
    </main>
  );
}
