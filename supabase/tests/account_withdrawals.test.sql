begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(28);

insert into auth.users (id, aud, role) values
  ('af010000-0000-4000-8000-000000000001', 'authenticated', 'authenticated'),
  ('af010000-0000-4000-8000-000000000002', 'authenticated', 'authenticated');
insert into auth.identities (provider_id, user_id, identity_data, provider) values
  ('withdrawal-test-1', 'af010000-0000-4000-8000-000000000001', '{"sub":"withdrawal-test-1"}', 'kakao'),
  ('withdrawal-test-2', 'af010000-0000-4000-8000-000000000002', '{"sub":"withdrawal-test-2"}', 'kakao');
insert into auth.sessions (id, user_id) values
  ('af020000-0000-4000-8000-000000000001', 'af010000-0000-4000-8000-000000000001'),
  ('af020000-0000-4000-8000-000000000002', 'af010000-0000-4000-8000-000000000001'),
  ('af020000-0000-4000-8000-000000000004', 'af010000-0000-4000-8000-000000000002');

insert into public.account_profiles (user_id, display_name) values
  ('af010000-0000-4000-8000-000000000001', 'first account'),
  ('af010000-0000-4000-8000-000000000002', 'second account');

insert into public.household_profiles (user_id, applicant_monthly_income_krw) values
  ('af010000-0000-4000-8000-000000000001', 0),
  ('af010000-0000-4000-8000-000000000002', 1000);

select ok(not has_function_privilege('authenticated', 'public.request_account_withdrawal(uuid,uuid,text,text)', 'EXECUTE'),
  'ordinary accounts cannot enqueue deletion directly');
select ok(not has_function_privilege('anon', 'public.get_account_withdrawal_status(text)', 'EXECUTE'),
  'anonymous callers cannot query withdrawal receipts');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"af010000-0000-4000-8000-000000000001","session_id":"af020000-0000-4000-8000-000000000001"}';
select ok(public.is_active_service_account(), 'verified Kakao session is active');
select ok((select count(*) = 1 from public.account_profiles), 'own display name visible before withdrawal');
select ok((select count(*) = 1 and min(applicant_monthly_income_krw) = 0
  from public.household_profiles), 'own household only and zero income are preserved');
set local "request.jwt.claims" = '{"sub":"af010000-0000-4000-8000-000000000001","session_id":"af020000-0000-4000-8000-000000000003"}';
select ok(not public.is_active_service_account(), 'a revoked or missing session cannot access private data');
set local "request.jwt.claims" = '{"sub":"af010000-0000-4000-8000-000000000002","session_id":"af020000-0000-4000-8000-000000000001"}';
select ok(not public.is_active_service_account(), 'a session must belong to the current account');
reset role;

set local role service_role;
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000001',
  'af020000-0000-4000-8000-000000000003', 'withdrawal-test-1', repeat('e', 64)) is null,
  'a revoked session cannot enqueue deletion');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000001',
  'af020000-0000-4000-8000-000000000001', 'withdrawal-test-2', repeat('f', 64)) is null,
  'a changed or different Kakao identity cannot enqueue deletion');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000001',
  'af020000-0000-4000-8000-000000000001', 'withdrawal-test-1', repeat('a', 64)) = 'pending',
  'service can persist a withdrawal job');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000001',
  'af020000-0000-4000-8000-000000000001', 'withdrawal-test-1', repeat('a', 64)) = 'pending',
  'same receipt can retry');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000001',
  'af020000-0000-4000-8000-000000000001', 'withdrawal-test-1', repeat('b', 64)) = 'pending',
  'another verified request can obtain its own receipt');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000002',
  'af020000-0000-4000-8000-000000000004', 'withdrawal-test-2', repeat('a', 64)) is null,
  'an existing pending receipt cannot be assigned to another user');
select ok(public.request_account_withdrawal('af010000-0000-4000-8000-000000000002',
  'af020000-0000-4000-8000-000000000004', 'withdrawal-test-2', repeat('c', 64)) = 'pending',
  'another account can queue independently');
reset role;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"af010000-0000-4000-8000-000000000001","session_id":"af020000-0000-4000-8000-000000000002"}';
select ok(public.is_account_withdrawal_pending(), 'another browser session sees the pending account');
select ok(not public.is_active_service_account(), 'pending account cannot access personal data');
select ok((select count(*) = 0 from public.account_profiles), 'pending account cannot read its display name');
select ok((select count(*) = 0 from public.household_profiles), 'pending account cannot read its household');
reset role;

select throws_ok(
  $$update public.account_profiles set display_name = 'late write'
      where user_id = 'af010000-0000-4000-8000-000000000001'$$,
  '42501', 'Account withdrawal is pending', 'write guard also rejects a pending owner at write time'
);

create function pg_temp.reject_test_deletion() returns trigger language plpgsql as $$
begin
  raise exception 'test retry';
end;
$$;
create trigger reject_test_deletion before delete on auth.users for each row
  when (old.id = 'af010000-0000-4000-8000-000000000001') execute function pg_temp.reject_test_deletion();

do $$ begin perform account_private.process_account_withdrawals(); end; $$;
select ok(public.get_account_withdrawal_status(repeat('a', 64)) = 'pending', 'failed deletion is queued for retry');
select ok(public.get_account_withdrawal_status(repeat('c', 64)) = 'completed', 'failure does not block unrelated deletions');

drop trigger reject_test_deletion on auth.users;
update account_private.withdrawals set next_attempt_at = now()
  where user_id = 'af010000-0000-4000-8000-000000000001';
do $$ begin perform account_private.process_account_withdrawals(); end; $$;

select ok(public.get_account_withdrawal_status(repeat('a', 64)) = 'completed'
  and public.get_account_withdrawal_status(repeat('b', 64)) = 'completed', 'both receipts report completion after retry');
select ok(not exists(select 1 from public.account_profiles)
  and not exists(select 1 from public.household_profiles) and not exists(
  select 1 from auth.sessions where user_id = 'af010000-0000-4000-8000-000000000001'),
  'owned rows and all sessions are removed');
select ok(not exists(select 1 from auth.identities where provider_id in ('withdrawal-test-1', 'withdrawal-test-2')),
  'old identities are removed so the provider can register a new account');
select ok((select count(*) = 0 from account_private.withdrawals where user_id is not null),
  'completed receipts retain no account ID');
set local role authenticated;
select ok(not public.is_active_service_account(), 'a previously issued JWT has no access after deletion');
reset role;

insert into auth.users (id, aud, role) values
  ('af010000-0000-4000-8000-000000000003', 'authenticated', 'authenticated');
insert into auth.identities (provider_id, user_id, identity_data, provider) values
  ('withdrawal-test-1', 'af010000-0000-4000-8000-000000000003', '{"sub":"withdrawal-test-1"}', 'kakao');
select ok(not exists(
  select 1 from public.account_profiles where user_id = 'af010000-0000-4000-8000-000000000003'
), 'registering the same provider identity does not restore the old profile');

update account_private.withdrawals set completed_at = now() - interval '25 hours';
do $$ begin perform account_private.process_account_withdrawals(); end; $$;
select ok(public.get_account_withdrawal_status(repeat('a', 64)) is null,
  'completed receipts are purged after the retention window');

select * from finish();
rollback;
