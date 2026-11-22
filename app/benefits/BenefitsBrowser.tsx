'use client';

import type { Benefit, Scope } from '@/lib/benefits';
import { useMemo, useState } from 'react';

const CATEGORY: Record<string, string> = {
  housing_loan: '주택 대출이자',
  housing_rent: '월세·보증료',
  housing_purchase: '주택 구입',
  housing_supply: '임대·분양 공급',
  marriage_grant: '결혼장려금',
  wedding: '결혼식',
  health_checkup: '건강검진',
  fertility: '난임',
  childbirth_parenting: '출산·양육',
  tax: '세금',
  other: '기타',
};
const SCOPE: Record<string, string> = {
  both: '부부 모두',
  either: '부부 중 1명',
  applicant: '신청인',
};
const DEADLINE: Record<string, string> = {
  always: '상시',
  period: '기간',
  annual: '매년',
  budget: '예산 소진 시',
  varies: '기관별 상이',
  unknown: '확인 필요',
};
const TAG: Record<string, string> = {
  first_marriage: '초혼',
  no_children: '무자녀',
  first_child: '첫째',
  pregnant: '임신',
  both_spouses_apply: '부부 함께',
  one_time: '1회 한정',
  no_duplicate: '중복수혜 불가',
  dual_income: '맞벌이',
  foreign_spouse_ok: '외국인 배우자',
};

type Status = 'any' | 'prospective' | 'married';

const won = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
    : `${Math.round(n / 10_000).toLocaleString()}만원`;

export default function BenefitsBrowser({
  benefits,
  regions,
}: {
  benefits: Benefit[];
  /** 시도 → 시군구 전체 목록 (보조금24 소관기관 기준). 혜택이 없는 시군구도 고를 수 있게 한다 */
  regions: Record<string, string[]>;
}) {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [status, setStatus] = useState<Status>('any');
  const [years, setYears] = useState('');
  const [age, setAge] = useState('');
  const [ownsHome, setOwnsHome] = useState(false);
  const [includeBroad, setIncludeBroad] = useState(true);
  const [hideStale, setHideStale] = useState(true);
  const [categories, setCategories] = useState<Set<string>>(new Set());

  const sidos = useMemo(() => Object.keys(regions).sort(), [regions]);
  // 시군구 자체 사업 수 (relevance가 incidental이 아닌 것)
  const localCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of benefits)
      if (b.sido && b.sigungu && b.relevance !== 'incidental')
        m[`${b.sido}|${b.sigungu}`] = (m[`${b.sido}|${b.sigungu}`] ?? 0) + 1;
    return m;
  }, [benefits]);
  const sigungus = regions[sido] ?? [];
  const selectedLocal = sigungu ? (localCount[`${sido}|${sigungu}`] ?? 0) : null;

  const base = useMemo(() => {
    const y = years === '' ? null : Number(years);
    const a = age === '' ? null : Number(age);
    return benefits.filter((b) => {
      if (b.relevance === 'incidental') return false;
      if (!includeBroad && b.relevance !== 'core') return false;
      if (hideStale && b.stale_suspect) return false;
      // 지역: 전국 사업 + 선택 광역 사업 + (시군구를 고르면) 그 시군구 사업만. 광역만 고르면 그 안의 시군구 사업도 모두 보인다
      if (sido && b.sido && b.sido !== sido) return false;
      if (sigungu && b.sigungu && b.sigungu !== sigungu) return false;
      if (status === 'prospective' && !b.prospective_allowed) return false;
      if (
        status === 'married' &&
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
  }, [benefits, sido, sigungu, status, years, age, ownsHome, includeBroad, hideStale]);

  const shown = useMemo(
    () =>
      base
        .filter((b) => categories.size === 0 || categories.has(b.category))
        .sort((x, y) => (y.amount_max_krw ?? -1) - (x.amount_max_krw ?? -1)),
    [base, categories],
  );
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of base) m[b.category] = (m[b.category] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [base]);

  const input =
    'rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700';

  return (
    <>
      <section className="mb-4 grid gap-3 rounded-md border border-zinc-200 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">거주 지역</span>
          <div className="flex gap-1">
            <select
              value={sido}
              onChange={(e) => {
                setSido(e.target.value);
                setSigungu('');
              }}
              className={`${input} min-w-0 flex-1`}
            >
              <option value="">전체</option>
              {sidos.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
              className={`${input} min-w-0 flex-1`}
            >
              <option value="">시군구 전체</option>
              {sigungus.map((s) => {
                const n = localCount[`${sido}|${s}`] ?? 0;
                return (
                  <option key={s} value={s}>
                    {s}
                    {n ? ` (${n})` : ' (지역 사업 없음)'}
                  </option>
                );
              })}
            </select>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">혼인 상태</span>
          <div className="flex gap-1">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={`${input} flex-1`}
            >
              <option value="any">상관없음</option>
              <option value="prospective">예비부부</option>
              <option value="married">혼인신고 함</option>
            </select>
            {status === 'married' && (
              <input
                type="number"
                min={0}
                step={0.5}
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="경과 년수"
                className={`${input} w-24`}
              />
            )}
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">나이 (부부 중 1명)</span>
          <input
            type="number"
            min={18}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="예: 32"
            className={input}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">옵션</span>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={ownsHome}
              onChange={(e) => setOwnsHome(e.target.checked)}
            />{' '}
            주택 보유
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={includeBroad}
              onChange={(e) => setIncludeBroad(e.target.checked)}
            />{' '}
            신혼 포함 일반 사업도
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={hideStale}
              onChange={(e) => setHideStale(e.target.checked)}
            />{' '}
            마감·오래된 정보 숨김
          </label>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {catCounts.map(([c, n]) => {
          const on = categories.has(c);
          return (
            <button
              key={c}
              onClick={() => {
                const next = new Set(categories);
                if (on) next.delete(c);
                else next.add(c);
                setCategories(next);
              }}
              className={`rounded-full border px-3 py-1 text-sm ${
                on
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              {CATEGORY[c] ?? c} <span className="opacity-75">{n}</span>
            </button>
          );
        })}
      </div>

      {selectedLocal === 0 && (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {sigungu}가 보조금24에 등록한 신혼부부 대상 자체 사업이 없습니다. 전국·{sido} 단위 혜택만
          보여 드려요. 시·구청 홈페이지에 따로 공고된 사업이 있을 수 있습니다.
        </p>
      )}
      <p className="mb-3 text-xs text-zinc-500">
        {shown.length}건 · 최대 지원금액 순 · 나이·혼인기간은 원문 기준 단순 비교라 실제 자격은
        상세에서 확인하세요
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((b) => (
          <BenefitCard key={b.service_id} b={b} />
        ))}
        {shown.length === 0 && (
          <li className="text-sm text-zinc-500">조건에 맞는 혜택이 없습니다.</li>
        )}
      </ul>
    </>
  );
}

function Chip({
  children,
  tone = 'zinc',
}: {
  children: React.ReactNode;
  tone?: 'zinc' | 'rose' | 'amber';
}) {
  const cls = {
    zinc: 'border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
    amber:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  }[tone];
  return <span className={`rounded border px-1.5 py-0.5 text-xs ${cls}`}>{children}</span>;
}

function BenefitCard({ b }: { b: Benefit }) {
  const [open, setOpen] = useState(false);
  const region = b.level === 'national' ? '전국' : [b.sido, b.sigungu].filter(Boolean).join(' ');
  const scope = (s: Scope) => (s ? ` (${SCOPE[s]})` : '');
  const income =
    b.income_kind === 'median_pct' && b.income_max_median_pct
      ? `중위소득 ${b.income_max_median_pct}% 이하`
      : b.income_kind === 'annual_krw' && b.income_max_annual_krw
        ? `연소득 ${won(b.income_max_annual_krw)} 이하`
        : b.income_kind === 'other'
          ? '소득기준 있음'
          : null;
  const deadline =
    b.deadline_type === 'period' && (b.apply_start || b.apply_end)
      ? `${b.apply_start ?? ''} ~ ${b.apply_end ?? ''}`
      : DEADLINE[b.deadline_type ?? 'unknown'];

  return (
    <li className="flex flex-col rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-zinc-500">
            {region} · {CATEGORY[b.category] ?? b.category}
            {b.relevance === 'includes' && ' · 신혼 포함 일반'}
          </div>
          <h3 className="font-semibold">{b.name}</h3>
        </div>
        {b.amount_max_krw ? (
          <div className="shrink-0 text-right">
            <div className="text-xs text-zinc-500">최대</div>
            <div className="font-semibold text-rose-600 tabular-nums dark:text-rose-400">
              {won(b.amount_max_krw)}
            </div>
          </div>
        ) : null}
      </div>
      {b.summary && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{b.summary}</p>}

      <div className="mt-2 flex flex-wrap gap-1">
        {b.marriage_max_years !== null && (
          <Chip tone="rose">혼인 {b.marriage_max_years}년 이내</Chip>
        )}
        {b.prospective_allowed && <Chip tone="rose">예비부부 가능</Chip>}
        {(b.age_min !== null || b.age_max !== null) && (
          <Chip>
            {b.age_min ?? ''}~{b.age_max ?? ''}세{scope(b.eligibility.age?.scope ?? null)}
          </Chip>
        )}
        {income && <Chip>{income}</Chip>}
        {b.homeless_required && <Chip>무주택</Chip>}
        {b.residency_required && (
          <Chip>
            거주{b.residency_min_months ? ` ${b.residency_min_months}개월+` : ''}
            {scope(b.residency_scope)}
          </Chip>
        )}
        {b.tags.map((t) => (
          <Chip key={t}>{TAG[t] ?? t}</Chip>
        ))}
        <Chip>신청 {deadline}</Chip>
        {b.stale_suspect && <Chip tone="amber">정보 확인 필요</Chip>}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-2 self-start text-xs text-zinc-500 underline"
      >
        {open ? '접기' : '자세히'}
      </button>
      {open && (
        <dl className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
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
          <div className="flex gap-3 pt-1">
            {b.detail_url && (
              <a
                href={b.detail_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                보조금24 원문
              </a>
            )}
            {b.application.online_url && (
              <a
                href={b.application.online_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                온라인 신청
              </a>
            )}
          </div>
        </dl>
      )}
    </li>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-14 shrink-0 text-zinc-400">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
