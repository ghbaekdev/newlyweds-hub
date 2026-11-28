import Link from 'next/link';

import { BenefitCategoryLabel, BenefitLevel } from '@/entities/benefits/model/types';
import type { Benefit } from '@/entities/benefits/model/types';
import type { MyhomeNoticeSummary } from '@/entities/housing-notices/model/myhomeNoticeDetails';
import { MyhomeKind } from '@/entities/housing-notices/model/types';

import Card from '@/shared/ui/Card';

const services = [
  { href: '/housing', label: '주택 공고', description: '공공임대·공공분양 모집 정보' },
  { href: '/benefits', label: '지원 혜택', description: '지역별 주거비·결혼·건강 지원' },
  {
    href: '/benefits/raw',
    label: '보조금24 원본 탐색',
    description: '보조금24 공공서비스 원본 정보',
  },
] as const;

type Props = {
  notices: MyhomeNoticeSummary[] | null;
  benefits: Benefit[] | null;
};

export default function SupportHubView({ notices, benefits }: Props) {
  return (
    <main className="hub-page">
      <div className="hub-container pt-8 pb-14 sm:pt-12">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-4xl leading-tight font-bold tracking-[-0.055em] sm:text-6xl">
            신혼부부 지원 찾기
          </h1>
          <p className="text-hub-muted mt-2">주택 공고와 우리 지역의 지원 혜택을 확인하세요.</p>
        </header>
        <div className="grid items-start gap-4 md:grid-cols-[minmax(16rem,0.44fr)_minmax(0,1fr)] md:gap-6">
          <Card
            as="section"
            className="bg-hub-navy rounded-xl px-4 py-3 text-white sm:p-6"
            aria-labelledby="hub-services"
          >
            <h2 id="hub-services" className="mb-1 text-lg font-bold">
              서비스
            </h2>
            <ul className="divide-y divide-[#48657d]">
              {services.map(({ href, label, description }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex min-h-16 items-center justify-between gap-3 py-2 sm:min-h-[4.5rem]"
                  >
                    <span className="grid gap-0.5">
                      <strong className="group-hover:underline group-hover:underline-offset-4">
                        {label}
                      </strong>
                      <span className="text-sm text-[#d3e1ef]">{description}</span>
                    </span>
                    <span aria-hidden="true" className="text-[#dceeff]">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid gap-4">
            <Card
              as="section"
              className="border-hub-line rounded-xl border bg-white px-4 py-3 sm:px-5"
              aria-labelledby="hub-housing"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="hub-housing" className="text-lg font-bold">
                  주택 공고
                </h2>
                <Link
                  href="/housing"
                  className="text-hub-accent flex min-h-11 items-center text-sm font-bold hover:underline"
                >
                  공고 전체{' '}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Link>
              </div>
              {notices?.length ? (
                <ul className="divide-hub-line divide-y">
                  {notices.map((notice) => {
                    const [location, ...otherLocations] = notice.location.split(', ');
                    const start =
                      notice.applicationPeriods?.[0]?.opensOn ?? notice.catalogPeriod?.startsOn;
                    return (
                      <li key={notice.slug} className="max-sm:nth-[n+2]:hidden">
                        <Link
                          href={`/housing/${notice.slug}`}
                          prefetch={false}
                          className="group flex min-h-16 items-center justify-between gap-3 py-2"
                        >
                          <span className="grid gap-0.5">
                            <span className="text-hub-muted text-sm">
                              {notice.kind === MyhomeKind.RENT ? '공공임대' : '공공분양'}
                              {location && ` · ${location}`}
                              {otherLocations.length > 0 && ` 외 ${otherLocations.length}곳`}
                            </span>
                            <strong className="leading-snug group-hover:underline">
                              {notice.title}
                            </strong>
                          </span>
                          {start && (
                            <time
                              dateTime={start}
                              className="text-hub-accent shrink-0 text-sm font-semibold"
                            >
                              {start.slice(5).replace('-', '.')}
                            </time>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-hub-muted py-2 text-sm">
                  {notices
                    ? '표시할 주택 공고가 없습니다.'
                    : '주택 공고 요약을 불러오지 못했습니다.'}
                </p>
              )}
            </Card>
            <Card
              as="section"
              className="border-hub-line rounded-xl border bg-white px-4 py-3 sm:px-5"
              aria-labelledby="hub-benefits"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="hub-benefits" className="text-lg font-bold">
                  지원 혜택
                </h2>
                <Link
                  href="/benefits"
                  className="text-hub-accent flex min-h-11 items-center text-sm font-bold hover:underline"
                >
                  혜택 전체{' '}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Link>
              </div>
              {benefits?.length ? (
                <ul className="divide-hub-line divide-y">
                  {benefits.map((benefit) => {
                    const area =
                      benefit.level === BenefitLevel.NATIONAL
                        ? '전국'
                        : [benefit.sido, benefit.sigungu].filter(Boolean).join(' ');
                    return (
                      <li key={benefit.service_id} className="max-sm:nth-[n+2]:hidden">
                        <Link
                          href={`/benefits#benefit-${benefit.service_id}`}
                          className="group flex min-h-16 items-center justify-between gap-3 py-2"
                        >
                          <span className="grid gap-0.5">
                            <span className="text-hub-muted text-sm">
                              {BenefitCategoryLabel[benefit.category] ?? benefit.category}
                              {area && ` · ${area}`}
                            </span>
                            <strong className="leading-snug group-hover:underline">
                              {benefit.name}
                            </strong>
                          </span>
                          <span aria-hidden="true" className="text-hub-accent">
                            →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-hub-muted py-2 text-sm">
                  {benefits
                    ? '표시할 지원 혜택이 없습니다.'
                    : '지원 혜택 요약을 불러오지 못했습니다.'}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
