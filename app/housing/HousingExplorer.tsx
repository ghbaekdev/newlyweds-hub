'use client';

import { useEffect, useMemo, useState } from 'react';

import type {
  ApplyhomeItem,
  HousingSnapshot,
  MyhomeItem,
} from '@/entities/housing-notices/model/types';

type Tab = 'applyhome' | 'myhome';

export default function HousingExplorer() {
  const [data, setData] = useState<HousingSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState({ n: 0, refresh: false });
  const [tab, setTab] = useState<Tab>('applyhome');
  const [onlyNewlywed, setOnlyNewlywed] = useState(true);
  const [region, setRegion] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/housing${request.refresh ? '?refresh=1' : ''}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? r.statusText);
        if (!cancelled) setData(j);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [request]);

  const apply = useMemo(
    () =>
      (data?.applyhome ?? []).filter(
        (i) => (!onlyNewlywed || i.newlywedUnits > 0) && (!region || i.region === region),
      ),
    [data, onlyNewlywed, region],
  );
  const myhome = useMemo(
    () =>
      (data?.myhome ?? []).filter(
        (i) =>
          (!onlyNewlywed || i.newlyweds) &&
          (!region || i.regions.some((r) => r.startsWith(region))),
      ),
    [data, onlyNewlywed, region],
  );
  const regions = useMemo(
    () => [...new Set((data?.applyhome ?? []).map((i) => i.region))].filter(Boolean).sort(),
    [data],
  );

  const s = data && {
    notices: data.applyhome.length,
    withNewlywed: data.applyhome.filter((i) => i.newlywedUnits > 0).length,
    units: data.applyhome.reduce((a, i) => a + i.newlywedUnits, 0),
    myhome: data.myhome.length,
    myhomeNewlywed: data.myhome.filter((i) => i.newlyweds).length,
    suppliers: [...new Set(data.myhome.map((i) => i.supplier))].join(', '),
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">주택 공고 (청약홈 · 마이홈 API 테스트)</h1>
          <p className="mt-1 text-sm text-zinc-500">
            청약홈 APT 분양(최근 90일) + 주택형별 신혼부부 특공 세대수·접수건수 / 마이홈
            공공임대·공공분양(최근 6개월)
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            setRequest((r) => ({ n: r.n + 1, refresh: true }));
          }}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {loading ? '불러오는 중…' : 'API에서 새로 받기'}
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      {loading && !data && (
        <p className="text-sm text-zinc-500">
          공고와 주택형별 정보를 받는 중입니다 (처음엔 30초~1분)…
        </p>
      )}

      {data && s && (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="청약홈 APT 공고" value={s.notices} />
            <Stat label="신혼 특공·신희타 포함" value={s.withNewlywed} />
            <Stat label="신혼 대상 세대" value={s.units} />
            <Stat label="마이홈 공고 (신혼 표기)" value={`${s.myhome} (${s.myhomeNewlywed})`} />
          </section>
          <p className="mb-4 text-xs text-zinc-500">마이홈 공급기관: {s.suppliers}</p>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(['applyhome', 'myhome'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-sm ${
                  tab === t
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black'
                    : 'border border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {t === 'applyhome'
                  ? `청약홈 분양 ${apply.length}`
                  : `마이홈 공공주택 ${myhome.length}`}
              </button>
            ))}
            <label className="ml-2 flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={onlyNewlywed}
                onChange={(e) => setOnlyNewlywed(e.target.checked)}
              />
              신혼 관련만
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            >
              <option value="">전체 지역</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {tab === 'applyhome' ? <ApplyhomeTable items={apply} /> : <MyhomeList items={myhome} />}
          <p className="mt-3 text-xs text-zinc-500">
            캐시 시각 {new Date(data.fetchedAt).toLocaleString('ko-KR')}
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function ApplyhomeTable({ items }: { items: ApplyhomeItem[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
          <tr>
            <th className="p-2">공고</th>
            <th className="p-2">지역</th>
            <th className="p-2">모집공고일</th>
            <th className="p-2 text-right">전체 세대</th>
            <th className="p-2 text-right">신혼 세대</th>
            <th className="p-2 text-right">신혼 접수</th>
            <th className="p-2 text-right">배율</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((i) => (
            <tr key={i.id}>
              <td className="p-2">
                <a
                  href={i.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                >
                  {i.name}
                </a>
                <div className="text-xs text-zinc-500">
                  {i.isNewlywedTown ? (
                    <span className="mr-1 rounded bg-rose-100 px-1 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      신혼희망타운
                    </span>
                  ) : (
                    <span className="mr-1">{i.houseType}</span>
                  )}
                  {i.saleType} · 특공접수 {i.specialStart || '-'} · 발표 {i.winnerDate || '-'}
                </div>
              </td>
              <td className="p-2 whitespace-nowrap">{i.region}</td>
              <td className="p-2 whitespace-nowrap tabular-nums">{i.announceDate}</td>
              <td className="p-2 text-right tabular-nums">{i.totalUnits.toLocaleString()}</td>
              <td className="p-2 text-right tabular-nums">{i.newlywedUnits.toLocaleString()}</td>
              <td className="p-2 text-right tabular-nums">
                {i.newlywedApplicants?.toLocaleString() ?? '-'}
              </td>
              <td className="p-2 text-right tabular-nums">
                {i.newlywedRatio != null ? `${i.newlywedRatio.toFixed(1)}:1` : '-'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="p-4 text-zinc-500">
                조건에 맞는 공고가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MyhomeList({ items }: { items: MyhomeItem[] }) {
  return (
    <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {items.map((i) => (
        <li key={i.id} className="p-3 text-sm">
          <a href={i.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
            {i.name}
          </a>
          <div className="mt-0.5 text-xs text-zinc-500">
            <span className="mr-1 rounded border border-zinc-300 px-1 dark:border-zinc-700">
              {i.kind}
            </span>
            {i.supplier} · {i.supplyType} · {i.houseType} · {i.status} · 공고 {i.announceDate} ·
            접수 {i.beginDate}~{i.endDate} · 단지 {i.complexes}개
          </div>
          <div className="mt-0.5 truncate text-xs text-zinc-400">{i.regions.join(', ')}</div>
        </li>
      ))}
      {items.length === 0 && (
        <li className="p-4 text-sm text-zinc-500">조건에 맞는 공고가 없습니다.</li>
      )}
    </ul>
  );
}
