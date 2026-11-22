#!/usr/bin/env node
// 정규화한 혜택 데이터를 Supabase에 upsert 한다.
//   node --env-file=.env.local scripts/load-benefits.mjs [data/benefits.sources.json] [data/benefits.normalized.json]
// 필요 env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const [
  sourcesPath = 'data/benefits.sources.json',
  normalizedPath = 'data/benefits.normalized.json',
] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY 가 .env.local에 필요합니다.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));
const normalized = JSON.parse(readFileSync(normalizedPath, 'utf8'));

const sourceRows = sources.map((s) => ({
  service_id: s.service_id,
  source: 'gov24',
  source_hash: s.source_hash,
  raw: s,
}));

const benefitRows = normalized.map((b) => {
  const e = b.eligibility ?? {};
  const a = b.application ?? {};
  return {
    service_id: b.service_id,
    source_hash: b.source_hash,
    name: b.name,
    org_name: b.org_name,
    level: b.level,
    sido: b.sido,
    sigungu: b.sigungu,
    relevance: b.relevance,
    category: b.category,
    benefit_type: b.benefit_type,
    summary: b.summary,
    amount_max_krw: b.amount_max_krw,
    amount_text: b.amount_text,
    marriage_max_years: e.marriage?.max_years ?? null,
    prospective_allowed: e.marriage?.prospective_allowed ?? false,
    age_min: e.age?.min ?? null,
    age_max: e.age?.max ?? null,
    income_kind: e.income?.kind ?? null,
    income_max_median_pct: e.income?.max_median_pct ?? null,
    income_max_annual_krw: e.income?.max_annual_krw ?? null,
    homeless_required: e.homeless_required ?? null,
    residency_required: e.residency?.required ?? null,
    residency_scope: e.residency?.scope ?? null,
    residency_min_months: e.residency?.min_months ?? null,
    tags: e.tags ?? [],
    deadline_type: a.deadline_type ?? null,
    apply_start: a.start ?? null,
    apply_end: a.end ?? null,
    detail_url: a.detail_url ?? null,
    eligibility: e,
    application: a,
    review: b.review ?? {},
    stale_suspect: b.review?.stale_suspect ?? false,
    confidence: b.review?.confidence ?? null,
    updated_at: new Date().toISOString(),
  };
});

async function upsert(table, rows) {
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await db
      .from(table)
      .upsert(rows.slice(i, i + 100), { onConflict: 'service_id' });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`${table}: ${rows.length} rows upserted`);
}

await upsert('benefit_sources', sourceRows);
await upsert('benefits', benefitRows);
