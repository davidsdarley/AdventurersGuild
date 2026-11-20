-- Let the API roles use the table. RLS still decides which rows they see:
-- anon gets no rows (no policy for it), authenticated can read all profiles.
grant select on table public.profiles to anon, authenticated;
grant all on table public.profiles to service_role;