-- Sign-up: every new auth user must carry a valid invite code and a free
-- username in raw_user_meta_data. The trigger below is the real check; any
-- failure raises, which aborts the auth.users insert, so no account exists.
--
-- Note: Supabase Auth hides the trigger's message from the client (it
-- reports "Database error saving new user"), so the UI calls check_signup
-- first to show a useful error.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text := new.raw_user_meta_data ->> 'username';
  v_code text := new.raw_user_meta_data ->> 'invite_code';
  v_invite public.invite_codes%rowtype;
begin
  if v_code is null or v_code = '' then
    raise exception 'invalid_code';
  end if;

  -- Lock the code row so two sign-ups cannot use one one-time code
  select * into v_invite
    from public.invite_codes ic
   where ic.code = v_code
   for update;

  if not found
     or v_invite.revoked
     or (v_invite.kind = 'one_time' and v_invite.used_at is not null) then
    raise exception 'invalid_code';
  end if;

  if v_username is null or char_length(v_username) not between 3 and 24 then
    raise exception 'invalid_username';
  end if;

  begin
    insert into public.profiles (id, username, roles)
    values (new.id, v_username, array['player']);
  exception
    when unique_violation then
      raise exception 'username_taken';
  end;

  if v_invite.kind = 'one_time' then
    update public.invite_codes
       set used_by = new.id,
           used_at = now()
     where id = v_invite.id;
  end if;

  return new;
end;
$$;

-- Only ever run by the trigger
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pre-check for the Register form. Returns 'ok', 'invalid_code' or
-- 'username_taken'. The code is checked first, so usernames cannot be
-- probed without a valid code. This does not reserve anything; the
-- trigger above still makes the final decision.
create function public.check_signup(username text, code text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
      from public.invite_codes ic
     where ic.code = check_signup.code
       and not ic.revoked
       and (ic.kind = 'master' or ic.used_at is null)
  ) then
    return 'invalid_code';
  end if;

  if exists (
    select 1 from public.profiles p where p.username = check_signup.username
  ) then
    return 'username_taken';
  end if;

  return 'ok';
end;
$$;

revoke execute on function public.check_signup(text, text) from public;
grant execute on function public.check_signup(text, text) to anon, authenticated, service_role;
