# AGENTS.md

## Project
Invite-only website for a D&D group ("the guild"): shared in-world records,
player profiles, and rules-aware character sheets for the 2014 and 2024 rules.
React + Vite + TypeScript frontend, Supabase backend (Postgres, Auth, Storage),
hosted on Vercel. The full spec is docs/SPEC.md. Read the sections your task
names before starting. If a task conflicts with the spec, ask me instead of
choosing.

Layout:
- src/rules/: rules engine (pure functions, no React or Supabase imports)
- src/data/: all Supabase queries, one module per entity
- src/pages/: one folder per page
- src/components/: shared UI
- supabase/migrations/: schema, RLS policies, and database functions
- supabase/seed/: SRD 5.1 and SRD 5.2 data and system record categories
- supabase/tests/: RLS tests
- Unit tests sit next to the file they test, as <name>.test.ts, and use Vitest

## Commands
- Dev server: npm run dev
- Build: npm run build
- Test: npm run test
- Type check: npx tsc --noEmit
- Lint: npm run lint
- Start local Supabase: npx supabase start
- Rebuild local database (runs all migrations and seeds): npx supabase db reset
- RLS tests: npx supabase test db
- Every migration that creates a table also grants access explicitly: select (and insert, update, delete where the policies allow them) to anon and authenticated, and all to service_role. Without grants, queries fail with "permission denied" on the hosted project.
- Regenerate database types: npx supabase gen types typescript --local > src/types/database.ts

## Conventions
- Use named exports, not default exports
- Do not use the `any` type; TypeScript runs in strict mode
- React function components and hooks only
- Style with Tailwind classes. Custom CSS goes only in src/index.css, and only when Tailwind can't do it; say why in a comment.
- Components never call Supabase directly; they go through src/data/
- src/rules/ must stay pure: no React, Supabase, or browser APIs, so it can be unit-tested on its own
- Every rules function has unit tests, covering both rulesets wherever they differ
- Displayed character values follow the spec: Custom Override if set, otherwise rules value + Custom Modifier
- Permissions are enforced in the database. Every new table enables RLS and gets its policies in the same migration. Hiding a button is never the only protection.
- Schema changes go in a new timestamped file in supabase/migrations/. After one, run npx supabase db reset and regenerate the database types.
- Responsive breakpoints: 768 px (navbar) and 1024 px (two-column character profile)

## Off-limits
- Do not edit a migration that already exists; write a new one instead
- Do not edit src/types/database.ts by hand (it is generated)
- Do not run commands against the hosted Supabase project (any command with --remote, such as npx supabase db push --remote, or npx supabase link); work only against the local database
- Do not commit .env files, keys, or passwords
- Do not build anything listed under "Out of scope" in docs/SPEC.md
- Do not add npm dependencies without asking

## AI attribution
After each task that changes files, append an entry to
AI-ATTRIBUTION.md in the repository root, creating the file if it does
not exist. Use this format, with today's date:
    ## YYYY-MM-DD: <each file changed, with (new file) after new ones>
    - Tool: <tool name>
    - Task: <the task I gave you, in one or two sentences>
    - Review: TODO
Leave the Review line as TODO. I fill it in after I review the change.
List every file you changed or created, including tests, and do not
list anything you did not change.

If a TypeScript file you created or changed does not already start
with this line, add it as the first line:
    // AI-assisted: see AI-ATTRIBUTION.md
