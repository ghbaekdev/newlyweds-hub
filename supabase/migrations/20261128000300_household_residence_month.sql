begin;

-- The backfill also normalizes rows awaiting deletion. Keep the owner guard
-- bypass scoped to this transaction and this table under an exclusive lock.
alter table public.household_profiles disable trigger household_profiles_require_active_owner;

-- Store residence months as the first day of the month. Income remains in won.
update public.household_profiles
set
  applicant_residence_since = date_trunc('month', applicant_residence_since::timestamp)::date,
  partner_residence_since = date_trunc('month', partner_residence_since::timestamp)::date
where
  extract(day from applicant_residence_since) <> 1
  or extract(day from partner_residence_since) <> 1;

alter table public.household_profiles
  add constraint household_profiles_applicant_residence_month_check
    check (extract(day from applicant_residence_since) = 1),
  add constraint household_profiles_partner_residence_month_check
    check (extract(day from partner_residence_since) = 1);


alter table public.household_profiles enable trigger household_profiles_require_active_owner;

commit;
