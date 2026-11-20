-- LOCAL DEVELOPMENT ONLY. Do not run against the hosted project.
-- Gives the local database a master invite code so you can register.
insert into public.invite_codes (code, kind)
values ('dev-master-code', 'master');
