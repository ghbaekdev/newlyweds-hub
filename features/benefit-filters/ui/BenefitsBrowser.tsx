'use client';

import { useState } from 'react';

import {
  BenefitLevel,
  BenefitRelevance,
  BenefitCategoryLabel as CATEGORY,
  DeadlineTypeLabel as DEADLINE,
  DeadlineType,
  IncomeKind,
  EligibilityScopeLabel as SCOPE,
  BenefitTagLabel as TAG,
} from '@/entities/benefits/model/types';
import type { Benefit, EligibilityScope as Scope } from '@/entities/benefits/model/types';

import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Checkbox from '@/shared/ui/Checkbox';
import Collapsible, { CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/Collapsible';
import FieldSet, { FieldLegend } from '@/shared/ui/FieldSet';
import FilterPanel from '@/shared/ui/FilterPanel';
import Input from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import NativeSelect from '@/shared/ui/NativeSelect';

const Status = { ANY: 'any', PROSPECTIVE: 'prospective', MARRIED: 'married' } as const;
type Status = (typeof Status)[keyof typeof Status];
type Props = {
  benefits: Benefit[];
  regions: Record<string, string[]>;
};
type Category = Benefit['category'];
type BenefitRowProps = { benefit: Benefit };
type RowProps = { k: string; v?: string | null };

const won = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
    : `${Math.round(n / 10_000).toLocaleString()}만원`;

export default function BenefitsBrowser({ benefits, regions }: Props) {
  const [query, setQuery] = useState('');
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [status, setStatus] = useState<Status>(Status.ANY);
  const [years, setYears] = useState('');
  const [age, setAge] = useState('');
  const [ownsHome, setOwnsHome] = useState(false);
  const [includeBroad, setIncludeBroad] = useState(true);
  const [hideStale, setHideStale] = useState(true);
  const [categories, setCategories] = useState<Set<Category>>(new Set());

  const sidos = Object.keys(regions).sort();
  const localCount: Record<string, number> = {};
  for (const benefit of benefits) {
    if (benefit.sido && benefit.sigungu && benefit.relevance !== BenefitRelevance.INCIDENTAL) {
      const key = `${benefit.sido}|${benefit.sigungu}`;
      localCount[key] = (localCount[key] ?? 0) + 1;
    }
  }
  const sigungus = regions[sido] ?? [];
  const selectedLocal = sigungu ? (localCount[`${sido}|${sigungu}`] ?? 0) : null;

  const y = years === '' ? null : Number(years);
  const a = age === '' ? null : Number(age);
  const term = query.trim().toLocaleLowerCase();
  const base = benefits.filter((b) => {
    if (!b.name.toLocaleLowerCase().includes(term)) return false;
    if (b.relevance === BenefitRelevance.INCIDENTAL) return false;
    if (!includeBroad && b.relevance !== BenefitRelevance.CORE) return false;
    if (hideStale && b.stale_suspect) return false;
    // 지역: 전국 사업 + 선택 광역 사업 + (시군구를 고르면) 그 시군구 사업만. 광역만 고르면 그 안의 시군구 사업도 모두 보인다
    if (sido && b.sido && b.sido !== sido) return false;
    if (sigungu && b.sigungu && b.sigungu !== sigungu) return false;
    if (status === Status.PROSPECTIVE && !b.prospective_allowed) return false;
    if (
      status === Status.MARRIED &&
      y !== null &&
      b.marriage_max_years !== null &&
      y > b.marriage_max_years
    )
      return false;
    if (
      a !== null &&
      ((b.age_min !== null && a < b.age_min) || (b.age_max !== null && a > b.age_max))
    )
      return false;
    if (ownsHome && b.homeless_required) return false;
    return true;
  });
  const shown = base
    .filter((b) => categories.size === 0 || categories.has(b.category))
    .sort((x, y) => (y.amount_max_krw ?? -1) - (x.amount_max_krw ?? -1));
  const counts = new Map<Category, number>();
  for (const benefit of base) counts.set(benefit.category, (counts.get(benefit.category) ?? 0) + 1);
  const categoryOptions = Array.from(new Set([...counts.keys(), ...categories])).sort(
    (left, right) => (counts.get(right) ?? 0) - (counts.get(left) ?? 0),
  );
  const hasConditions = Boolean(
    term ||
    sido ||
    status !== Status.ANY ||
    age ||
    ownsHome ||
    !includeBroad ||
    !hideStale ||
    categories.size,
  );

  function reset() {
    setQuery('');
    setSido('');
    setSigungu('');
    setStatus(Status.ANY);
    setYears('');
    setAge('');
    setOwnsHome(false);
    setIncludeBroad(true);
    setHideStale(true);
    setCategories(new Set());
  }

  return (
    <div className="hub-catalog">
      <FilterPanel hasConditions={hasConditions}>
        <div className="grid gap-3 text-sm">
          <Label className="text-hub-muted grid gap-1 font-semibold">
            혜택명 검색
            <Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </Label>
          <FieldSet className="grid gap-1">
            <FieldLegend className="text-hub-muted mb-1 font-semibold">거주 지역</FieldLegend>
            <NativeSelect
              aria-label="시도"
              value={sido}
              onChange={(event) => {
                setSido(event.target.value);
                setSigungu('');
              }}
            >
              <option value="">전체 시도</option>
              {sidos.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="시군구"
              value={sigungu}
              onChange={(event) => setSigungu(event.target.value)}
              disabled={!sido}
            >
              <option value="">시군구 전체</option>
              {sigungus.map((region) => {
                const count = localCount[`${sido}|${region}`] ?? 0;
                return (
                  <option key={region} value={region}>
                    {region}
                    {count ? ` (${count})` : ' (지역 사업 없음)'}
                  </option>
                );
              })}
            </NativeSelect>
          </FieldSet>
          <Label className="text-hub-muted grid gap-1 font-semibold">
            혼인 상태
            <NativeSelect
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
            >
              <option value={Status.ANY}>상관없음</option>
              <option value={Status.PROSPECTIVE}>예비부부</option>
              <option value={Status.MARRIED}>혼인신고 함</option>
            </NativeSelect>
          </Label>
          {status === Status.MARRIED && (
            <Label className="text-hub-muted grid gap-1 font-semibold">
              혼인 경과 년수
              <Input
                type="number"
                min={0}
                step={0.5}
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
            </Label>
          )}
          <Label className="text-hub-muted grid gap-1 font-semibold">
            나이 (부부 중 1명)
            <Input
              type="number"
              min={18}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="예: 32"
            />
          </Label>
          <FieldSet className="grid">
            <FieldLegend className="text-hub-muted font-semibold">선택 조건</FieldLegend>
            <Label className="flex min-h-9 items-center gap-2">
              <Checkbox
                checked={ownsHome}
                onCheckedChange={(checked) => setOwnsHome(checked === true)}
              />
              주택 보유
            </Label>
            <Label className="flex min-h-9 items-center gap-2">
              <Checkbox
                checked={includeBroad}
                onCheckedChange={(checked) => setIncludeBroad(checked === true)}
              />
              신혼 포함 일반 사업도
            </Label>
            <Label className="flex min-h-9 items-center gap-2">
              <Checkbox
                checked={hideStale}
                onCheckedChange={(checked) => setHideStale(checked === true)}
              />
              마감·오래된 정보 숨김
            </Label>
          </FieldSet>
          {categoryOptions.length > 0 && (
            <Collapsible className="border-hub-line border-t pt-1">
              <CollapsibleTrigger className="text-hub-muted min-h-11 cursor-pointer py-3 font-semibold before:mr-1 before:inline-block before:content-[\'▸\'] data-[state=open]:before:rotate-90">
                지원 분야{categories.size > 0 && ` · ${categories.size}개 선택`}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {categoryOptions.map((category) => (
                  <Label key={category} className="flex min-h-9 items-center gap-2">
                    <Checkbox
                      checked={categories.has(category)}
                      onCheckedChange={(checked) => {
                        const next = new Set(categories);
                        if (checked === true) next.add(category);
                        else next.delete(category);
                        setCategories(next);
                      }}
                    />
                    {CATEGORY[category] ?? category} ({counts.get(category) ?? 0})
                  </Label>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          <Button type="button" onClick={reset} variant="reset">
            조건 초기화
          </Button>
        </div>
      </FilterPanel>
      <section aria-labelledby="benefits-results">
        <h2 id="benefits-results" className="mb-2 text-lg font-bold">
          혜택 목록{' '}
          <span className="text-hub-muted text-sm font-medium" aria-live="polite">
            {shown.length}건
          </span>
        </h2>
        {selectedLocal === 0 && (
          <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {sigungu}가 보조금24에 등록한 신혼부부 대상 자체 사업이 없습니다. 전국·{sido} 단위
            혜택만 보여 드려요. 시·구청 홈페이지에 따로 공고된 사업이 있을 수 있습니다.
          </p>
        )}
        <p className="text-hub-muted mb-3 text-sm">
          최대 지원금액 순 · 실제 신청 자격은 상세와 원문에서 확인하세요.
        </p>
        {shown.length > 0 && (
          <div
            aria-hidden="true"
            className="bg-hub-soft text-hub-accent hidden grid-cols-[minmax(0,1fr)_minmax(0,0.54fr)_minmax(0,0.60fr)_1rem] gap-3 px-4 py-2 text-sm font-semibold lg:grid"
          >
            <span>혜택명</span>
            <span>지역</span>
            <span>최대 지원·신청</span>
          </div>
        )}
        <ul className="divide-hub-line divide-y bg-white">
          {shown.map((benefit) => (
            <BenefitRow key={benefit.service_id} benefit={benefit} />
          ))}
          {shown.length === 0 && (
            <li className="text-hub-muted p-4 text-sm">조건에 맞는 혜택이 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function BenefitRow({ benefit: b }: BenefitRowProps) {
  const region =
    b.level === BenefitLevel.NATIONAL ? '전국' : [b.sido, b.sigungu].filter(Boolean).join(' ');
  const scope = (s: Scope | null) => (s ? ` (${SCOPE[s]})` : '');
  const income =
    b.income_kind === IncomeKind.MEDIAN_PCT && b.income_max_median_pct
      ? `중위소득 ${b.income_max_median_pct}% 이하`
      : b.income_kind === IncomeKind.ANNUAL_KRW && b.income_max_annual_krw
        ? `연소득 ${won(b.income_max_annual_krw)} 이하`
        : b.income_kind === IncomeKind.OTHER
          ? '소득기준 있음'
          : null;
  const deadline =
    b.deadline_type === DeadlineType.PERIOD && (b.apply_start || b.apply_end)
      ? `${b.apply_start ?? ''} ~ ${b.apply_end ?? ''}`
      : DEADLINE[b.deadline_type ?? DeadlineType.UNKNOWN];

  return (
    <li id={`benefit-${b.service_id}`} className="target:bg-hub-soft scroll-mt-4">
      <Collapsible className="group">
        <CollapsibleTrigger className="hover:bg-hub-row-hover focus-visible:bg-hub-row-hover grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_minmax(0,1fr)_1rem] items-center gap-x-3 gap-y-1 px-4 py-3 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,0.54fr)_minmax(0,0.60fr)_1rem]">
          <span className="col-span-2 grid gap-0.5 lg:col-span-1">
            <span className="text-hub-accent text-sm font-semibold">
              {CATEGORY[b.category] ?? b.category}
              {b.relevance === BenefitRelevance.INCLUDES && ' · 신혼 포함 일반'}
            </span>
            <strong className="leading-snug tracking-tight group-hover:underline">{b.name}</strong>
          </span>
          <span className="text-hub-muted col-start-1 row-start-2 text-sm lg:col-start-2 lg:row-start-1">
            {region || '지역 확인 필요'}
          </span>
          <span className="text-hub-muted col-start-2 row-start-2 grid gap-0.5 text-sm lg:col-start-3 lg:row-start-1">
            {b.amount_max_krw ? (
              <strong className="text-hub-accent">최대 {won(b.amount_max_krw)}</strong>
            ) : null}
            <span>신청 {deadline}</span>
          </span>
          <span
            aria-hidden="true"
            className="text-hub-accent col-start-3 row-start-1 group-data-[state=open]:hidden lg:col-start-4"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="text-hub-accent col-start-3 row-start-1 hidden group-data-[state=open]:inline lg:col-start-4"
          >
            −
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-3 px-4 pt-1 pb-4">
            {b.summary && <p className="text-hub-muted text-sm">{b.summary}</p>}
            <div className="flex flex-wrap gap-1">
              {b.marriage_max_years !== null && (
                <Badge tone="blue">혼인 {b.marriage_max_years}년 이내</Badge>
              )}
              {b.prospective_allowed && <Badge tone="blue">예비부부 가능</Badge>}
              {(b.age_min !== null || b.age_max !== null) && (
                <Badge>
                  {b.age_min ?? ''}~{b.age_max ?? ''}세{scope(b.eligibility.age?.scope ?? null)}
                </Badge>
              )}
              {income && <Badge>{income}</Badge>}
              {b.homeless_required && <Badge>무주택</Badge>}
              {b.residency_required && (
                <Badge>
                  거주{b.residency_min_months ? ` ${b.residency_min_months}개월+` : ''}
                  {scope(b.residency_scope)}
                </Badge>
              )}
              {b.tags.map((t) => (
                <Badge key={t}>{TAG[t] ?? t}</Badge>
              ))}
              {b.stale_suspect && <Badge tone="amber">정보 확인 필요</Badge>}
            </div>
            <dl className="text-hub-muted space-y-1.5 text-sm">
              <Row k="기관" v={b.org_name} />
              <Row k="금액" v={b.amount_text} />
              <Row k="거주" v={b.eligibility.residency?.text} />
              <Row
                k="혼인"
                v={[b.eligibility.marriage?.basis, b.eligibility.marriage?.prospective_text]
                  .filter(Boolean)
                  .join(' / ')}
              />
              <Row k="소득" v={b.eligibility.income?.text} />
              <Row k="주택" v={b.eligibility.housing_limits} />
              <Row k="기타" v={b.eligibility.other?.join(' · ')} />
              <Row
                k="신청"
                v={[b.application.text, b.application.method].filter(Boolean).join(' / ')}
              />
              <Row k="검수 메모" v={b.review.notes} />
            </dl>
            <div className="flex flex-wrap gap-4 text-sm">
              {b.detail_url && (
                <a
                  href={b.detail_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-hub-accent flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  보조금24 원문
                </a>
              )}
              {b.application.online_url && (
                <a
                  href={b.application.online_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-hub-accent flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  온라인 신청
                </a>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function Row({ k, v }: RowProps) {
  if (!v) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 font-semibold">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
