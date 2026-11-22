-- Public read model. PDFs and raw extraction artifacts stay on the sync worker.
create table if not exists public.myhome_catalog (
  id smallint primary key check (id = 1),
  snapshot jsonb not null check (jsonb_typeof(snapshot -> 'notices') = 'array')
);

alter table public.myhome_catalog enable row level security;
revoke all on public.myhome_catalog from anon, authenticated;
grant select on public.myhome_catalog to anon, authenticated;
grant select, insert, update on public.myhome_catalog to service_role;

create policy "myhome catalog is publicly readable"
  on public.myhome_catalog for select
  to anon, authenticated
  using (true);
