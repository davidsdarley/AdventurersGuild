-- Sign-up through the auth.users trigger, and the check_signup pre-check.
-- Inserting into auth.users here stands in for Supabase Auth creating the
-- account; the trigger runs the same way.
begin;
create extension if not exists pgtap with schema extensions;

select plan(29);

-- Known starting state: one master code, no other codes
delete from public.invite_codes;
insert into public.invite_codes (code, kind) values ('test-master-one', 'master');
insert into public.invite_codes (code, kind) values ('ONETIMEAAAAA', 'one_time');
insert into public.invite_codes (code, kind, revoked) values ('REVOKEDAAAAA', 'one_time', true);

-- Master code works ---------------------------------------------------------

select lives_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000001', 'm1@test.local',
      '{"username": "master_one", "invite_code": "test-master-one"}') $$,
  'Sign-up with the master code succeeds'
);

select lives_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000002', 'm2@test.local',
      '{"username": "master_two", "invite_code": "test-master-one"}') $$,
  'The master code works a second time'
);

select is(
  (select roles from public.profiles where id = '10000000-0000-0000-0000-000000000001'),
  array['player'],
  'A new account gets a profile with only the Player role'
);

select is(
  (select username from public.profiles where id = '10000000-0000-0000-0000-000000000002'),
  'master_two',
  'The profile takes its username from the sign-up metadata'
);

select is(
  (select used_at from public.invite_codes where kind = 'master'),
  null,
  'The master code is never marked used'
);

-- One-time code works once --------------------------------------------------

select lives_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000003', 'o1@test.local',
      '{"username": "onetime_one", "invite_code": "ONETIMEAAAAA"}') $$,
  'Sign-up with an unused one-time code succeeds'
);

select is(
  (select used_by from public.invite_codes where code = 'ONETIMEAAAAA'),
  '10000000-0000-0000-0000-000000000003'::uuid,
  'The one-time code is marked used by the new account'
);

select isnt(
  (select used_at from public.invite_codes where code = 'ONETIMEAAAAA'),
  null,
  'The one-time code records when it was used'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000004', 'o2@test.local',
      '{"username": "onetime_two", "invite_code": "ONETIMEAAAAA"}') $$,
  'P0001', 'invalid_code',
  'A used one-time code fails'
);

select is(
  (select count(*)::int from auth.users where id = '10000000-0000-0000-0000-000000000004'),
  0,
  'No account is created when a used code is given'
);

-- Revoked, wrong and missing codes fail -------------------------------------

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000005', 'r@test.local',
      '{"username": "revoked_user", "invite_code": "REVOKEDAAAAA"}') $$,
  'P0001', 'invalid_code',
  'A revoked code fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000006', 'w@test.local',
      '{"username": "wrong_user", "invite_code": "NOT-A-REAL-CODE"}') $$,
  'P0001', 'invalid_code',
  'A wrong code fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000007', 'n@test.local',
      '{"username": "no_code_user"}') $$,
  'P0001', 'invalid_code',
  'A missing code fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000008', 'c@test.local',
      '{"username": "case_user", "invite_code": "onetimeaaaaa"}') $$,
  'P0001', 'invalid_code',
  'Codes are matched exactly, including case'
);

select is(
  (select count(*)::int from auth.users
    where id in ('10000000-0000-0000-0000-000000000005',
                 '10000000-0000-0000-0000-000000000006',
                 '10000000-0000-0000-0000-000000000007',
                 '10000000-0000-0000-0000-000000000008')),
  0,
  'No account is created for revoked, wrong or missing codes'
);

-- Usernames -----------------------------------------------------------------

insert into public.invite_codes (code, kind) values ('ONETIMEBBBBB', 'one_time');

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000009', 'd@test.local',
      '{"username": "master_one", "invite_code": "ONETIMEBBBBB"}') $$,
  'P0001', 'username_taken',
  'A duplicate username fails'
);

select is(
  (select count(*)::int from auth.users where id = '10000000-0000-0000-0000-000000000009'),
  0,
  'No account is created for a duplicate username'
);

select is(
  (select used_at from public.invite_codes where code = 'ONETIMEBBBBB'),
  null,
  'A failed sign-up leaves its one-time code unused'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000010', 'x@test.local',
      '{"username": "ab", "invite_code": "ONETIMEBBBBB"}') $$,
  'P0001', 'invalid_username',
  'A username shorter than 3 characters fails'
);

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('10000000-0000-0000-0000-000000000011', 'y@test.local',
      '{"invite_code": "ONETIMEBBBBB"}') $$,
  'P0001', 'invalid_username',
  'A missing username fails'
);

-- check_signup, called the way the Register page calls it (as anon) --------

set local role anon;

select is(public.check_signup('fresh_name', 'test-master-one'), 'ok',
  'check_signup: free username and master code is ok');
select is(public.check_signup('fresh_name', 'ONETIMEBBBBB'), 'ok',
  'check_signup: free username and unused one-time code is ok');
select is(public.check_signup('fresh_name', 'ONETIMEAAAAA'), 'invalid_code',
  'check_signup: a used code is invalid');
select is(public.check_signup('fresh_name', 'REVOKEDAAAAA'), 'invalid_code',
  'check_signup: a revoked code is invalid');
select is(public.check_signup('fresh_name', 'NOT-A-REAL-CODE'), 'invalid_code',
  'check_signup: a wrong code is invalid');
select is(public.check_signup('fresh_name', null), 'invalid_code',
  'check_signup: a missing code is invalid');
select is(public.check_signup('master_one', 'ONETIMEBBBBB'), 'username_taken',
  'check_signup: a taken username is reported');
select is(public.check_signup('master_one', 'NOT-A-REAL-CODE'), 'invalid_code',
  'check_signup: the code is checked before the username');

reset role;

select is(
  (select used_at from public.invite_codes where code = 'ONETIMEBBBBB'),
  null,
  'check_signup does not use up a code'
);

select * from finish();
rollback;
