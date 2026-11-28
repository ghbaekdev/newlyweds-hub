'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { MyhomeNoticeSummary } from '@/entities/housing-notices/model/myhomeNoticeDetails';
import { MyhomeKind } from '@/entities/housing-notices/model/types';

import Button from '@/shared/ui/Button';
import FilterPanel from '@/shared/ui/FilterPanel';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import NativeSelect from '@/shared/ui/NativeSelect';

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
    <div className="hub-catalog">
      <FilterPanel hasConditions={Boolean(term || filter !== ALL)}>
        <div className="grid gap-3 text-sm">
          <Label className="text-hub-muted grid gap-1 font-semibold">
            공고명 또는 지역
            <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </Label>
          <Label className="text-hub-muted grid gap-1 font-semibold">
            공급 유형
            <NativeSelect
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
            >
              {(Object.keys(labels) as Filter[]).map((kind) => (
                <option key={kind} value={kind}>
                  {labels[kind]}
                </option>
              ))}
            </NativeSelect>
          </Label>
          <Button
            type="button"
            onClick={() => {
              setQuery('');
              setFilter(ALL);
            }}
            variant="reset"
          >
            조건 초기화
          </Button>
        </div>
      </FilterPanel>
      <section aria-labelledby="notices-heading">
        <h2 id="notices-heading" className="mb-2 text-lg font-bold">
          공고 목록{' '}
          <span className="text-hub-muted text-sm font-medium" aria-live="polite">
            {visible.length}건
          </span>
        </h2>
        {visible.length > 0 && (
          <div
            aria-hidden="true"
            className="bg-hub-soft text-hub-accent hidden grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_1rem] gap-3 px-4 py-2 text-sm font-semibold lg:grid"
          >
            <span>공고명</span>
            <span>지역</span>
            <span>접수 기간</span>
          </div>
        )}
        {visible.length === 0 && (
          <p className="text-hub-muted bg-white p-4 text-sm">조건에 맞는 공고가 없습니다.</p>
        )}
        <ul className="divide-hub-line divide-y bg-white">
          {visible.map((notice) => {
            const period = notice.applicationPeriods?.at(-1);
            const catalog = notice.catalogPeriod;
            return (
              <li key={notice.slug}>
                <Link
                  href={`/housing/${notice.slug}`}
                  prefetch={false}
                  className="group hover:bg-hub-row-hover focus-visible:bg-hub-row-hover grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_1rem] items-center gap-x-3 gap-y-1 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)_minmax(0,0.75fr)_1rem]"
                >
                  <div className="col-span-2 min-w-0 lg:col-span-1">
                    <p className="text-hub-accent text-sm font-semibold">{labels[notice.kind]}</p>
                    <h3 className="leading-snug font-bold tracking-tight group-hover:underline">
                      {notice.title}
                    </h3>
                    {notice.statusLabel && (
                      <p className="text-hub-muted mt-1 text-sm">{notice.statusLabel}</p>
                    )}
                    {notice.reviewNote && (
                      <p className="mt-1 text-sm font-medium text-[#80511c]">정정공고 확인 필요</p>
                    )}
                  </div>
                  <span className="text-hub-muted col-start-1 row-start-2 text-sm lg:col-start-2 lg:row-start-1">
                    {notice.location}
                  </span>
                  <span className="text-hub-muted col-start-2 row-start-2 text-sm lg:col-start-3 lg:row-start-1">
                    {period
                      ? `${period.group} ${period.opensOn} ~ ${period.closesOn}`
                      : catalog?.startsOn || catalog?.endsOn
                        ? `${catalog.startsOn ?? '미정'} ~ ${catalog.endsOn ?? '미정'}`
                        : '접수 일정 미제공'}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-hub-accent col-start-3 row-start-1 lg:col-start-4"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
