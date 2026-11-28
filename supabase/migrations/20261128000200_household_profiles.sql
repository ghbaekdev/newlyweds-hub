create table public.household_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  desired_regions text[] not null default '{}',
  applicant_monthly_income_krw bigint check (applicant_monthly_income_krw between 0 and 9007199254740991),
  partner_monthly_income_krw bigint check (partner_monthly_income_krw between 0 and 9007199254740991),
  applicant_home_ownership text check (applicant_home_ownership in ('owned', 'not_owned', 'unknown')),
  partner_home_ownership text check (partner_home_ownership in ('owned', 'not_owned', 'unknown')),
  applicant_residence_province text check (applicant_residence_province ~ '^[가-힣]{1,30}$'),
  applicant_residence_district text check (applicant_residence_district ~ '^[가-힣]{1,30}$'),
  applicant_residence_since date check (applicant_residence_since between date '0001-01-01' and date '9999-12-31'),
  partner_residence_province text check (partner_residence_province ~ '^[가-힣]{1,30}$'),
  partner_residence_district text check (partner_residence_district ~ '^[가-힣]{1,30}$'),
  partner_residence_since date check (partner_residence_since between date '0001-01-01' and date '9999-12-31'),
  marriage_status text check (marriage_status in ('prospective', 'married', 'other')),
  marriage_registered_on date check (marriage_registered_on between date '0001-01-01' and date '9999-12-31'),
  household_size integer check (household_size > 0),
  constraint household_profiles_desired_regions_shape check (
    coalesce(array_ndims(desired_regions), 1) = 1
    and cardinality(desired_regions) <= 300
    and desired_regions::text ~ '^[{]([가-힣]{1,30}([|][가-힣]{1,30})?(,[가-힣]{1,30}([|][가-힣]{1,30})?)*)?[}]$'
  ),
  check (applicant_residence_district is null or applicant_residence_province is not null),
  check (partner_residence_district is null or partner_residence_province is not null)
);

alter table public.household_profiles enable row level security;

revoke all on public.household_profiles from public, anon, authenticated;
grant select, insert, update on public.household_profiles to authenticated;

create policy "household profile is readable by its active owner"
  on public.household_profiles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_service_account()));

create policy "household profile is insertable by its active owner"
  on public.household_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_active_service_account()));

create policy "household profile is updatable by its active owner"
  on public.household_profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_service_account()))
  with check (user_id = (select auth.uid()) and (select public.is_active_service_account()));

create trigger household_profiles_require_active_owner
  before insert or update on public.household_profiles
  for each row execute function account_private.require_active_profile_write();
