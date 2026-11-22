-- 신혼부부 혜택 (보조금24 원천을 정규화한 데이터)
-- Supabase SQL Editor에서 한 번 실행한다.

-- 원천 데이터: 보조금24 API 응답 원문 (재수집·변경 감지용). 클라이언트에 노출하지 않는다.
create table if not exists public.benefit_sources (
  service_id   text primary key,
  source       text not null default 'gov24',
  source_hash  text not null,                -- 서비스명·지원대상·선정기준·지원내용·신청기한 기준 해시
  raw          jsonb not null,
  fetched_at   timestamptz not null default now()
);

-- 정규화 데이터: 앱이 읽는 테이블
create table if not exists public.benefits (
  service_id      text primary key references public.benefit_sources(service_id) on delete cascade,
  source_hash     text not null,              -- 정규화에 쓴 원문 해시 (benefit_sources와 다르면 재정규화 필요)
  name            text not null,
  org_name        text,
  level           text not null check (level in ('national','sido','sigungu','other')),
  sido            text,
  sigungu         text,
  relevance       text not null check (relevance in ('core','includes','incidental')),
  category        text not null check (category in ('housing_loan','housing_rent','housing_purchase','housing_supply','marriage_grant','wedding','health_checkup','fertility','childbirth_parenting','tax','other')),
  benefit_type    text not null check (benefit_type in ('cash','loan','in_kind','service','voucher','discount','housing','other')),
  summary         text,
  amount_max_krw  bigint,
  amount_text     text,

  -- 필터·판정용으로 펼친 컬럼 (원본은 eligibility jsonb)
  marriage_max_years      numeric,
  prospective_allowed     boolean not null default false,
  age_min                 int,
  age_max                 int,
  income_kind             text check (income_kind in ('median_pct','annual_krw','none','other')),
  income_max_median_pct   int,
  income_max_annual_krw   bigint,
  homeless_required       boolean,
  residency_required      boolean,
  residency_scope         text check (residency_scope in ('both','either','applicant')),
  residency_min_months    int,
  tags                    text[] not null default '{}',

  deadline_type   text check (deadline_type in ('always','period','annual','budget','varies','unknown')),
  apply_start     date,
  apply_end       date,
  detail_url      text,

  eligibility     jsonb not null,
  application     jsonb not null,
  review          jsonb not null,
  stale_suspect   boolean not null default false,
  confidence      text check (confidence in ('high','medium','low')),
  reviewed        boolean not null default false,   -- 사람이 검수했는지

  normalized_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists benefits_region_idx    on public.benefits (sido, sigungu);
create index if not exists benefits_category_idx  on public.benefits (category);
create index if not exists benefits_relevance_idx on public.benefits (relevance);

-- RLS: 정규화 테이블은 누구나 읽기만, 원천 테이블은 비공개 (쓰기는 secret key로만)
alter table public.benefit_sources enable row level security;
alter table public.benefits enable row level security;

drop policy if exists "benefits are readable by everyone" on public.benefits;
create policy "benefits are readable by everyone"
  on public.benefits for select
  to anon, authenticated
  using (true);
