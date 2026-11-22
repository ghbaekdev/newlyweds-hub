'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { MyhomeNoticeSummary } from '@/entities/housing-notices/model/myhomeNoticeDetails';
import { MyhomeKind } from '@/entities/housing-notices/model/types';

const ALL = '전체';

const labels = {
  [ALL]: '전체',
  [MyhomeKind.RENT]: '공공임대',
  [MyhomeKind.SALE]: '공공분양',
} as const;

type Filter = keyof typeof labels;
type Props = { notices: MyhomeNoticeSummary[] };

export default function HousingNoticeList({ notices }: Props) {
  const [filter, setFilter] = useState<Filter>(ALL);
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase();
  const visible = notices.filter(
    (notice) =>
      (filter === ALL || notice.kind === filter) &&
      `${notice.title} ${notice.location}`.toLocaleLowerCase().includes(term),
  );

  return (
    <section aria-labelledby="notices-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdd8ce] pb-4">
        <h2 id="notices-heading" className="text-lg font-bold">
          공고 목록{' '}
          <span className="font-medium text-[#425d51]" aria-live="polite">
            {visible.length}건
          </span>
        </h2>
        <div className="flex gap-1 rounded-lg bg-[#e6ece4] p-1" role="group" aria-label="공급 유형">
          {(Object.keys(labels) as Filter[]).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={kind === filter}
              onClick={() => setFilter(kind)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-white aria-pressed:bg-[#214838] aria-pressed:text-white"
            >
              {labels[kind]}
            </button>
          ))}
        </div>
      </div>
      <label className="my-4 block max-w-md text-sm font-semibold">
        공고명 또는 지역
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 block w-full rounded-md border border-[#a7b8ac] bg-white px-3 py-2"
        />
      </label>
      {visible.length === 0 && <p className="py-5 text-sm">조건에 맞는 공고가 없습니다.</p>}
      <ul className="divide-y divide-[#d8e0d6]">
        {visible.map((notice) => {
          const period = notice.applicationPeriods?.at(-1);
          return (
            <li key={notice.slug}>
              <Link
                href={`/housing/${notice.slug}`}
                prefetch={false}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-2 py-6 transition-colors hover:bg-white focus-visible:bg-white sm:px-4 sm:py-7"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#37574b]">
                    {labels[notice.kind]} <span aria-hidden="true">·</span> {notice.location}
                  </p>
                  <h3 className="mt-1.5 text-xl leading-snug font-bold tracking-tight sm:text-2xl">
                    {notice.title}
                  </h3>
                  {period && (
                    <p className="mt-2 text-sm text-[#425d51]">
                      {period.group} {period.opensOn} ~ {period.closesOn}
                    </p>
                  )}
                  {!period && (notice.catalogPeriod?.startsOn || notice.catalogPeriod?.endsOn) && (
                    <p className="mt-2 text-sm text-[#425d51]">
                      접수 {notice.catalogPeriod.startsOn ?? '미정'} ~{' '}
                      {notice.catalogPeriod.endsOn ?? '미정'}
                    </p>
                  )}
                  {notice.statusLabel && (
                    <p className="mt-1.5 text-sm text-[#425d51]">{notice.statusLabel}</p>
                  )}
                  {notice.reviewNote && (
                    <p className="mt-1.5 text-sm font-medium text-[#80511c]">정정공고 확인 필요</p>
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className="pr-1 text-xl transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
