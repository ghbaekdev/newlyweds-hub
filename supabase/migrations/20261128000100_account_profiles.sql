create table public.account_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (
    char_length(display_name) between 1 and 40
    and display_name = btrim(display_name)
    and display_name !~ '[[:cntrl:]]'
  )
);

alter table public.account_profiles enable row level security;
revoke all on table public.account_profiles from public, anon, authenticated;
grant select, insert, update on table public.account_profiles to authenticated;

create trigger account_profiles_require_active_owner
  before insert or update on public.account_profiles for each row
  execute function account_private.require_active_profile_write();

create policy "account owners read their profile"
  on public.account_profiles for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_service_account()));

create policy "account owners insert their profile"
  on public.account_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_active_service_account()));

create policy "account owners update their profile"
  on public.account_profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_service_account()))
  with check (user_id = (select auth.uid()) and (select public.is_active_service_account()));
