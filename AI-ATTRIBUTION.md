## 2026-11-20: supabase/migrations/20261120230000_roles.sql (new file), supabase/migrations/20261120230100_invite_codes.sql (new file), supabase/migrations/20261120230200_signup.sql (new file), supabase/seed/01_dev_master_code.sql (new file), supabase/tests/01_signup.test.sql (new file), supabase/tests/02_admin_codes_and_roles.test.sql (new file), supabase/config.toml, src/types/database.ts, AI-ATTRIBUTION.md (new file)
- Tool: Claude Code (Claude Opus 5.5)
- Task: Add the invite-code, role and sign-up database layer: invite_codes table, has_role, an auth.users trigger that enforces invite codes and creates Player profiles, check_signup, Admin-only code and role functions, RLS, grants, a dev master code seed, and pgTAP tests.
- Review: TODO
