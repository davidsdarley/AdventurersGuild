-- Reusable trigger function: keeps updated_at current on any table
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One profile per auth user
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (char_length(username) between 3 and 24),
  roles text[] not null default array['player']
    check (roles <@ array['admin', 'dm', 'player']),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Security: signed-in users can read profiles. No insert, update or
-- delete policies yet, so nobody can write until milestone 2 adds them.
alter table profiles enable row level security;

create policy "Signed-in users can read profiles"
  on profiles for select
  to authenticated
  using (true);