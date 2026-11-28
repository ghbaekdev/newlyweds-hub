create schema account_private;
revoke all on schema account_private from public, anon, authenticated, service_role;

create table account_private.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  queued_at timestamptz not null default now(),
  next_attempt_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((user_id is null) = (completed_at is not null))
);

create index withdrawal_queue_idx on account_private.withdrawals (next_attempt_at, queued_at)
  where completed_at is null;

create index withdrawal_completion_idx on account_private.withdrawals (completed_at)
  where completed_at is not null;

create table account_private.withdrawal_receipts (
  hash text primary key check (hash ~ '^[0-9a-f]{64}$'),
  withdrawal_id uuid not null references account_private.withdrawals on delete cascade
);

create index withdrawal_receipt_job_idx on account_private.withdrawal_receipts (withdrawal_id);

alter table account_private.withdrawals enable row level security;
alter table account_private.withdrawal_receipts enable row level security;

create function account_private.has_kakao_identity(target_user_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$
  select count(*) = 1 and count(*) filter (where provider = 'kakao') = 1
    from auth.identities
    where user_id = target_user_id;
$$;

create function public.is_active_service_account()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  with claims as (
    select auth.uid() as user_id, auth.jwt()->>'session_id' as session_id
  )
  select exists (
    select 1 from auth.sessions as session cross join claims
    where session.id = case
      when claims.session_id ~ '^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$'
      then claims.session_id::uuid
    end
      and session.user_id = claims.user_id
      and account_private.has_kakao_identity(claims.user_id)
      and not exists (
        select 1 from account_private.withdrawals as withdrawal
        where withdrawal.user_id = claims.user_id
      )
  );
$$;

create function public.is_account_withdrawal_pending()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from account_private.withdrawals where user_id = (select auth.uid())
  );
$$;

create function account_private.require_active_profile_write()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  -- Queue confirmation waits for in-flight profile writes. Writers that lose
  -- the race fail immediately, even if their RLS snapshot was taken earlier.
  if not pg_catalog.pg_try_advisory_xact_lock_shared(
    pg_catalog.hashtextextended(new.user_id::text, 20261128)
  ) or exists (
    select 1 from account_private.withdrawals where user_id = new.user_id
  ) then
    raise insufficient_privilege using message = 'Account withdrawal is pending';
  end if;

  return new;
end;
$$;

create function public.request_account_withdrawal(
  target_user_id uuid, target_session_id uuid, target_provider_id text, receipt_hash text
)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  prior account_private.withdrawals%rowtype;
  job_id uuid;
begin
  if target_user_id is null or receipt_hash is null or receipt_hash !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(target_user_id::text, 20261128)
  );

  select withdrawal.* into prior
    from account_private.withdrawals as withdrawal
    join account_private.withdrawal_receipts as receipt on receipt.withdrawal_id = withdrawal.id
    where receipt.hash = receipt_hash;

  if found then
    if prior.completed_at is not null then return 'completed'; end if;
    if prior.user_id = target_user_id then return 'pending'; end if;
    return null;
  end if;

  perform 1 from auth.users where id = target_user_id for update;
  if not found or not account_private.has_kakao_identity(target_user_id) then return null; end if;

  -- Bind confirmation to the same still-live session and provider identity
  -- checked by the application, even when sign-out races the confirmation.
  perform 1
    from auth.sessions as session
    join auth.identities as identity on identity.user_id = session.user_id
    where session.id = target_session_id
      and session.user_id = target_user_id
      and identity.provider = 'kakao'
      and identity.provider_id = target_provider_id
    for share of session, identity;
  if not found then return null; end if;

  select id into job_id from account_private.withdrawals where user_id = target_user_id;
  -- A conflicting receipt aborts this subtransaction, including any new job.
  begin
    if job_id is null then
      insert into account_private.withdrawals (user_id) values (target_user_id)
        returning id into job_id;
    end if;
    insert into account_private.withdrawal_receipts (hash, withdrawal_id) values (receipt_hash, job_id);
  exception when unique_violation then
    return null;
  end;

  return 'pending';
end;
$$;

create function public.get_account_withdrawal_status(receipt_hash text)
returns text
language sql stable security definer
set search_path = ''
as $$
  select case when withdrawal.completed_at is null then 'pending' else 'completed' end
    from account_private.withdrawal_receipts as receipt
    join account_private.withdrawals as withdrawal on withdrawal.id = receipt.withdrawal_id
    where receipt.hash = receipt_hash;
$$;

create function account_private.process_account_withdrawals()
returns void
language plpgsql
set search_path = ''
as $$
declare
  job record;
begin
  for job in
    select id, user_id from account_private.withdrawals
      where completed_at is null and next_attempt_at <= pg_catalog.now()
      order by next_attempt_at, queued_at
      limit 20
      for no key update skip locked
  loop
    begin
      -- Supabase Auth identities and sessions, and all first-stage profile
      -- tables, cascade from auth.users. Commit completion with the deletion.
      delete from auth.users where id = job.user_id;
      update account_private.withdrawals
        set user_id = null, completed_at = pg_catalog.now()
        where id = job.id;
    exception when others then
      update account_private.withdrawals
        set next_attempt_at = pg_catalog.now() + interval '1 minute'
        where id = job.id;
      raise warning 'Account withdrawal will be retried (SQLSTATE %)', sqlstate;
    end;
  end loop;

  delete from account_private.withdrawals where completed_at < pg_catalog.now() - interval '24 hours';
end;
$$;

revoke all on all functions in schema account_private from public, anon, authenticated, service_role;
revoke all on function public.is_active_service_account() from public, anon, authenticated, service_role;
revoke all on function public.is_account_withdrawal_pending() from public, anon, authenticated, service_role;
revoke all on function public.request_account_withdrawal(uuid, uuid, text, text) from public, anon, authenticated, service_role;
revoke all on function public.get_account_withdrawal_status(text) from public, anon, authenticated, service_role;

grant execute on function public.is_active_service_account() to authenticated;
grant execute on function public.is_account_withdrawal_pending() to authenticated;
grant execute on function public.request_account_withdrawal(uuid, uuid, text, text) to service_role;
grant execute on function public.get_account_withdrawal_status(text) to service_role;

do $$
begin
  if not pg_catalog.has_table_privilege(current_user, 'auth.users', 'DELETE') then
    raise insufficient_privilege using message = 'The account withdrawal worker must be able to delete Auth users';
  end if;
end;
$$;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'newlyweds-account-withdrawals',
  '* * * * *',
  $$select account_private.process_account_withdrawals()$$
);
