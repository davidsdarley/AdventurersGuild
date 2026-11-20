-- Admin functions (invite codes, master code, roles) and who may use them,
-- plus RLS on invite_codes and profiles.
begin;
create extension if not exists pgtap with schema extensions;

select plan(31);

-- Setup: an Admin and a Player, both signed up with the master code
delete from public.invite_codes;
insert into public.invite_codes (code, kind) values ('test-master-one', 'master');

insert into auth.users (id, email, raw_user_meta_data) values
  ('20000000-0000-0000-0000-00000000000a', 'admin@test.local',
   '{"username": "the_admin", "invite_code": "test-master-one"}'),
  ('20000000-0000-0000-0000-00000000000b', 'player@test.local',
   '{"username": "the_player", "invite_code": "test-master-one"}');

-- The first Admin is made by hand, as in production
update public.profiles set roles = array['admin', 'player']
 where id = '20000000-0000-0000-0000-00000000000a';

insert into public.invite_codes (code, kind) values ('PLAYERSEESNO', 'one_time');

-- Non-Admin (signed-in Player) ----------------------------------------------

select set_config('request.jwt.claims',
  '{"sub": "20000000-0000-0000-0000-00000000000b", "role": "authenticated"}', true);
set local role authenticated;

select is(public.has_role('player'), true, 'has_role: the Player has player');
select is(public.has_role('admin'), false, 'has_role: the Player does not have admin');

select is((select count(*)::int from public.invite_codes), 0,
  'A Player cannot read invite_codes');

select throws_ok(
  $$ select public.create_invite_codes(1) $$,
  '42501', 'admin_only', 'A Player cannot create invite codes');
select throws_ok(
  $$ select public.revoke_invite_code('PLAYERSEESNO') $$,
  '42501', 'admin_only', 'A Player cannot revoke invite codes');
select throws_ok(
  $$ select public.set_master_code('player-master-code') $$,
  '42501', 'admin_only', 'A Player cannot set the master code');
select throws_ok(
  $$ select public.set_user_roles('20000000-0000-0000-0000-00000000000b', array['admin']) $$,
  '42501', 'admin_only', 'A Player cannot change roles, including their own');

select throws_ok(
  $$ insert into public.invite_codes (code, kind) values ('PLAYERMADEIT', 'one_time') $$,
  '42501', null, 'A Player cannot insert invite codes directly');
select throws_ok(
  $$ update public.invite_codes set revoked = true $$,
  '42501', null, 'A Player cannot update invite codes directly');
select throws_ok(
  $$ delete from public.invite_codes $$,
  '42501', null, 'A Player cannot delete invite codes directly');
select throws_ok(
  $$ update public.profiles set roles = array['admin', 'player']
      where id = '20000000-0000-0000-0000-00000000000b' $$,
  '42501', null, 'A Player cannot update profiles directly');

reset role;

-- Anon (signed out) ---------------------------------------------------------

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is((select count(*)::int from public.invite_codes), 0,
  'Anon cannot read invite_codes');
select throws_ok(
  $$ select public.create_invite_codes(1) $$,
  '42501', null, 'Anon cannot call create_invite_codes');
select throws_ok(
  $$ select public.set_master_code('anon-master-code') $$,
  '42501', null, 'Anon cannot call set_master_code');

reset role;

-- Admin ---------------------------------------------------------------------

select set_config('request.jwt.claims',
  '{"sub": "20000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);
set local role authenticated;

select is(public.has_role('admin'), true, 'has_role: the Admin has admin');

select is((select count(*)::int from public.invite_codes), 2,
  'An Admin can read invite_codes');

create temporary table new_codes on commit drop as
  select c as code from public.create_invite_codes(3) as c;

select is((select count(*)::int from new_codes), 3,
  'create_invite_codes returns the requested number of codes');
select ok(
  (select bool_and(code ~ '^[A-HJ-NP-Z2-9]{12}$') from new_codes),
  'Generated codes are 12 characters from the code alphabet');
select is(
  (select count(*)::int from public.invite_codes ic
     join new_codes n on n.code = ic.code
    where ic.kind = 'one_time' and not ic.revoked and ic.used_at is null
      and ic.created_by = '20000000-0000-0000-0000-00000000000a'),
  3,
  'Generated codes are stored as unused one-time codes created by the Admin');
select throws_ok(
  $$ select public.create_invite_codes(0) $$,
  '22023', 'invalid_count', 'create_invite_codes refuses a count of 0');

select lives_ok(
  $$ select public.revoke_invite_code('PLAYERSEESNO') $$,
  'An Admin can revoke an unused one-time code');
select is(
  (select revoked from public.invite_codes where code = 'PLAYERSEESNO'),
  true, 'The revoked code is marked revoked');
select throws_ok(
  $$ select public.revoke_invite_code('test-master-one') $$,
  '22023', 'cannot_revoke_master', 'The master code cannot be revoked');

select lives_ok(
  $$ select public.set_master_code('test-master-two') $$,
  'An Admin can change the master code');
select is(
  (select count(*)::int from public.invite_codes where kind = 'master'), 1,
  'There is still exactly one master code');

select throws_ok(
  $$ select public.set_user_roles('20000000-0000-0000-0000-00000000000a', array['dm', 'player']) $$,
  '42501', 'cannot_remove_own_admin', 'An Admin cannot remove their own admin role');
select is(
  public.set_user_roles('20000000-0000-0000-0000-00000000000b', array['dm']),
  array['dm', 'player'],
  'set_user_roles grants DM and always keeps player');
select is(
  public.set_user_roles('20000000-0000-0000-0000-00000000000b', array[]::text[]),
  array['player'],
  'Removing every role still leaves player');
select throws_ok(
  $$ select public.set_user_roles('20000000-0000-0000-0000-00000000000b', array['king']) $$,
  '22023', 'invalid_roles', 'set_user_roles refuses unknown roles');

reset role;

-- The old master code stops working; the new one works ----------------------

select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('20000000-0000-0000-0000-00000000000c', 'old@test.local',
      '{"username": "old_master", "invite_code": "test-master-one"}') $$,
  'P0001', 'invalid_code',
  'The old master code fails after set_master_code');
select lives_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data) values
     ('20000000-0000-0000-0000-00000000000d', 'new@test.local',
      '{"username": "new_master", "invite_code": "test-master-two"}') $$,
  'The new master code works');

select * from finish();
rollback;
