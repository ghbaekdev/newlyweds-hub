"use client";

import { useEffect, useMemo, useState } from "react";

type Hit = { field: string; keyword: string; snippet: string };
type Item = {
  id: string;
  name: string;
  org: string;
  orgType: string;
  field: string;
  supportType: string;
  target: string;
  content: string;
  deadline: string;
  url: string;
  views: number;
  keywords: string[];
  hits: Hit[];
};
type Result = {
  fetchedAt: string;
  totalCount: number;
  loadedCount: number;
  matchedCount: number;
  keywords: string[];
  stats: Record<"byKeyword" | "byField" | "byOrgType" | "byServiceField", [string, number][]>;
  items: Item[];
};
type Detail = {
  detail: Record<string, string> | null;
  conditions: { ageFrom: unknown; ageTo: unknown; flags: { code: string; label: string }[] };
};

export default function BenefitsExplorer() {
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKeywords, setActiveKeywords] = useState<Set<string>>(new Set());
  const [orgType, setOrgType] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const [request, setRequest] = useState({ n: 0, refresh: false });

  function reload() {
    setLoading(true);
    setError(null);
    setRequest((r) => ({ n: r.n + 1, refresh: true }));
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/gov24/newlywed${request.refresh ? "?refresh=1" : ""}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? res.statusText);
        if (cancelled) return;
        setData(json);
        setActiveKeywords(new Set((json as Result).keywords.filter((k) => k !== "결혼이민")));
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [request]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim();
    return data.items.filter(
      (i) =>
        i.keywords.some((k) => activeKeywords.has(k)) &&
        (!orgType || i.orgType === orgType) &&
        (!q || `${i.name} ${i.org} ${i.target}`.includes(q)),
    );
  }, [data, activeKeywords, orgType, query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">신혼부부 혜택 탐색 (보조금24 API 테스트)</h1>
          <p className="mt-1 text-sm text-zinc-500">
            행정안전부 공공서비스(혜택) 정보 전체 목록에서 서비스명·목적·지원대상·선정기준·지원내용을 키워드로 찾습니다.
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {loading ? "불러오는 중…" : "API에서 새로 받기"}
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {loading && !data && <p className="text-sm text-zinc-500">전체 서비스 목록을 받는 중입니다 (처음엔 10~30초 걸려요)…</p>}

      {data && (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="전체 서비스" value={data.totalCount.toLocaleString()} />
            <Stat label="받은 건수" value={data.loadedCount.toLocaleString()} />
            <Stat label="키워드 매칭" value={data.matchedCount.toLocaleString()} />
            <Stat label="현재 필터" value={filtered.length.toLocaleString()} />
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <Breakdown title="매칭 필드" rows={data.stats.byField} />
            <Breakdown title="소관기관유형" rows={data.stats.byOrgType} />
            <Breakdown title="서비스분야" rows={data.stats.byServiceField} />
          </section>

          <section className="mb-4 flex flex-wrap items-center gap-2">
            {data.stats.byKeyword.map(([k, n]) => {
              const on = activeKeywords.has(k);
              return (
                <button
                  key={k}
                  onClick={() => {
                    const next = new Set(activeKeywords);
                    if (on) next.delete(k);
                    else next.add(k);
                    setActiveKeywords(next);
                  }}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    on
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {k} <span className="opacity-75">{n}</span>
                </button>
              );
            })}
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            >
              <option value="">소관기관유형 전체</option>
              {data.stats.byOrgType.map(([k]) => (
                <option key={k} value={k === "(없음)" ? "" : k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="서비스명·기관·대상 검색 (예: 서울, 전세)"
              className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-sm dark:border-zinc-700"
            />
          </section>

          <p className="mb-3 text-xs text-zinc-500">
            캐시 시각 {new Date(data.fetchedAt).toLocaleString("ko-KR")} · 조회수 순 정렬
          </p>

          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {filtered.slice(0, 300).map((i) => (
              <li key={i.id} className="p-4">
                <button className="w-full text-left" onClick={() => setOpen(open === i.id ? null : i.id)}>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{i.name}</span>
                    <span className="text-xs text-zinc-500">
                      {i.org} · {i.orgType} · {i.field} · {i.supportType}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {i.keywords.map((k) => (
                      <span key={k} className="rounded bg-rose-100 px-1.5 text-xs text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {k}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {i.hits.slice(0, 2).map((h, idx) => (
                      <li key={idx}>
                        <span className="mr-1 text-xs text-zinc-400">[{h.field}]</span>
                        <Highlight text={h.snippet} />
                      </li>
                    ))}
                  </ul>
                </button>
                {open === i.id && <ServiceDetail id={i.id} url={i.url} />}
              </li>
            ))}
            {filtered.length === 0 && <li className="p-4 text-sm text-zinc-500">조건에 맞는 서비스가 없습니다.</li>}
          </ul>
          {filtered.length > 300 && <p className="mt-2 text-xs text-zinc-500">상위 300건만 표시합니다.</p>}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <div className="mb-2 text-xs text-zinc-500">{title}</div>
      <ul className="space-y-0.5">
        {rows.slice(0, 6).map(([k, n]) => (
          <li key={k} className="flex justify-between gap-2">
            <span className="truncate">{k}</span>
            <span className="tabular-nums text-zinc-500">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const HL = /(신혼|예비\s?(?:부부|신랑|신부)|혼인|결혼)/g;
function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(HL).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800 dark:text-white">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

const DETAIL_FIELDS = ["서비스목적", "지원대상", "선정기준", "지원내용", "신청방법", "신청기한", "구비서류", "접수기관명", "문의처"];

function ServiceDetail({ id, url }: { id: string; url: string }) {
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/gov24/service/${encodeURIComponent(id)}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? r.statusText);
        setD(j);
      })
      .catch((e) => setErr(String(e.message ?? e)));
  }, [id]);

  if (err) return <p className="mt-3 text-sm text-red-600">{err}</p>;
  if (!d) return <p className="mt-3 text-sm text-zinc-500">상세 불러오는 중…</p>;

  const { conditions } = d;
  return (
    <div className="mt-3 space-y-3 rounded-md bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
      <div>
        <div className="mb-1 text-xs font-medium text-zinc-500">지원조건 (supportConditions)</div>
        <div className="flex flex-wrap gap-1">
          {(conditions.ageFrom != null || conditions.ageTo != null) && (
            <span className="rounded border border-zinc-300 px-1.5 text-xs dark:border-zinc-700">
              연령 {String(conditions.ageFrom ?? "")}~{String(conditions.ageTo ?? "")}
            </span>
          )}
          {conditions.flags.map((f) => (
            <span key={f.code} className="rounded border border-zinc-300 px-1.5 text-xs dark:border-zinc-700" title={f.code}>
              {f.label}
            </span>
          ))}
          {conditions.flags.length === 0 && <span className="text-xs text-zinc-500">표시된 조건 없음</span>}
        </div>
      </div>
      {d.detail &&
        DETAIL_FIELDS.filter((f) => d.detail?.[f]).map((f) => (
          <div key={f}>
            <div className="text-xs font-medium text-zinc-500">{f}</div>
            <p className="whitespace-pre-line">
              <Highlight text={d.detail![f]} />
            </p>
          </div>
        ))}
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="inline-block text-xs text-blue-600 underline">
          보조금24에서 보기
        </a>
      )}
    </div>
  );
}
