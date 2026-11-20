## 2026-11-20: supabase/migrations/20261120230000_roles.sql (new file), supabase/migrations/20261120230100_invite_codes.sql (new file), supabase/migrations/20261120230200_signup.sql (new file), supabase/seed/01_dev_master_code.sql (new file), supabase/tests/01_signup.test.sql (new file), supabase/tests/02_admin_codes_and_roles.test.sql (new file), supabase/config.toml, src/types/database.ts, AI-ATTRIBUTION.md (new file)
- Tool: Claude Code (Claude Opus 5.5)
- Task: Add the invite-code, role and sign-up database layer: invite_codes table, has_role, an auth.users trigger that enforces invite codes and creates Player profiles, check_signup, Admin-only code and role functions, RLS, grants, a dev master code seed, and pgTAP tests.
- Review: TODO

## 2026-11-20: package.json, package-lock.json, src/App.tsx, src/data/health.ts (deleted), src/data/auth.ts (new file), src/data/profiles.ts (new file), src/components/authRedirect.ts (new file), src/components/authRedirect.test.ts (new file), src/components/RequireAuth.tsx (new file), src/components/AppLayout.tsx (new file), src/components/LoadingScreen.tsx (new file), src/components/ComingSoon.tsx (new file), src/components/navLinks.ts (new file), src/components/navLinks.test.ts (new file), src/components/Navbar.tsx (new file), src/components/Navbar.test.tsx (new file), src/pages/Login/LoginPage.tsx (new file), src/pages/Register/RegisterPage.tsx (new file), src/pages/ResetPassword/ResetPasswordPage.tsx (new file), src/pages/Records/RecordsPage.tsx (new file), src/pages/Players/PlayersPage.tsx (new file), src/pages/PlayerProfile/PlayerProfilePage.tsx (new file), src/pages/Characters/CharactersPage.tsx (new file), src/pages/Npcs/NpcsPage.tsx (new file), src/pages/Compendium/CompendiumPage.tsx (new file), src/pages/Admin/AdminPage.tsx (new file), src/pages/Admin/AdminPage.test.tsx (new file), src/pages/NotFound/NotFoundPage.tsx (new file), AI-ATTRIBUTION.md
- Tool: Claude Code (Claude Opus 5.5)
- Task: Add React Router routes with placeholder pages for Phase 1, a session provider and useSession() hook, a redirect of signed-out visitors to /login that keeps the original path, and the role-aware responsive navbar; remove the Supabase connection check.
- Review: TODO

## 2026-11-20: tsconfig.app.json, tsconfig.node.json, AI-ATTRIBUTION.md
- Tool: Claude Code (Claude Opus 5.5)
- Task: Turn on TypeScript strict mode explicitly in the app and node tsconfigs.
- Review: TODO
