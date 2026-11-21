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

## 2026-11-20: src/data/auth.ts, src/App.tsx, src/components/AuthForm.tsx (new file), src/pages/Login/LoginPage.tsx, src/pages/Login/login.ts (new file), src/pages/Login/login.test.ts (new file), src/pages/Register/RegisterPage.tsx, src/pages/Register/register.ts (new file), src/pages/Register/register.test.ts (new file), src/pages/ForgotPassword/ForgotPasswordPage.tsx (new file), src/pages/ResetPassword/ResetPasswordPage.tsx, supabase/config.toml, AI-ATTRIBUTION.md
- Tool: Claude Code (Claude Opus 5.5)
- Task: Build the Register, Login, Forgot password and Reset password pages: invite-code registration using check_signup then signUp, login with a generic error and return-to-page redirect, and password reset by email, with unit tests for Register errors and the post-login redirect.
- Review: TODO

## 2026-11-20: supabase/config.toml, AI-ATTRIBUTION.md
- Tool: Claude Code (Claude Opus 5.5)
- Task: Fix the seed path in the local Supabase config so db reset loads supabase/seed/*.sql (including the dev master code), then reset the local database.
- Review: TODO

## 2026-11-20: src/data/admin.ts (new file), src/data/admin.test.ts (new file), src/pages/Admin/AdminPage.tsx, src/pages/Admin/InviteCodesSection.tsx (new file), src/pages/Admin/CodesList.tsx (new file), src/pages/Admin/CodesList.test.tsx (new file), src/pages/Admin/MasterCodeSection.tsx (new file), src/pages/Admin/RolesSection.tsx (new file), src/pages/Admin/RolesList.tsx (new file), src/pages/Admin/RolesList.test.tsx (new file), src/pages/Admin/roles.ts (new file), src/pages/Admin/roles.test.ts (new file), src/pages/Admin/ui.tsx (new file), src/pages/Admin/format.ts (new file), AI-ATTRIBUTION.md
- Tool: Claude Code (Claude Opus 5.5)
- Task: Build the Admin page: generate (1 to 20), list and revoke one-time invite codes, view and change the master code, and toggle DM and Admin roles (own Admin toggle disabled), with data calls in src/data/admin.ts and unit tests for the codes list states and the disabled own-Admin toggle.
- Review: TODO
