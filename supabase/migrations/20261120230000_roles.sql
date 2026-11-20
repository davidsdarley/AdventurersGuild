-- Roles: has_role() for RLS policies and functions, and set_user_roles()
-- as the only way to change a profile's roles.

-- Supabase's default privileges give anon and authenticated every table
-- privilege on new tables, including TRUNCATE, which RLS does not cover.
-- profiles stays read-only through the API: remove everything but select.
revoke insert, update, delete, truncate, references, trigger
  on table public.profiles from anon, authenticated;

-- Whether the signed-in user (auth.uid()) holds the given role.
-- Security definer so it works inside RLS policies on any table without
-- depending on the caller's own access to profiles.
create function public.has_role(role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and has_role.role = any (p.roles)
  );
$$;

revoke execute on function public.has_role(text) from public, anon;
grant execute on function public.has_role(text) to authenticated, service_role;

-- Admin only. Replaces a user's roles. 'player' is always kept, and an
-- Admin cannot remove their own 'admin' role. Returns the roles saved.
create function public.set_user_roles(user_id uuid, roles text[])
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_roles text[];
begin
  if not public.has_role('admin') then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  if set_user_roles.roles is null
     or not (set_user_roles.roles <@ array['admin', 'dm', 'player']) then
    raise exception 'invalid_roles'
      using errcode = '22023',
            detail = 'Roles must be drawn from admin, dm, player.';
  end if;

  -- Canonical order, no duplicates, player always present
  select array_agg(r order by ord)
    into v_roles
    from unnest(array['admin', 'dm', 'player']) with ordinality as t(r, ord)
   where r = 'player' or r = any (set_user_roles.roles);

  if set_user_roles.user_id = auth.uid() and not ('admin' = any (v_roles)) then
    raise exception 'cannot_remove_own_admin' using errcode = '42501';
  end if;

  update public.profiles
     set roles = v_roles
   where id = set_user_roles.user_id;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  return v_roles;
end;
$$;

revoke execute on function public.set_user_roles(uuid, text[]) from public, anon;
grant execute on function public.set_user_roles(uuid, text[]) to authenticated, service_role;
