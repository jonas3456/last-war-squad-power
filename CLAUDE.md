# CLAUDE.md

## Project

Last War Squad Power Tracker — a Next.js App Router application for tracking hero squad power levels in a Last War game alliance. Leaders manage players and view dashboards; players submit power data via tokenized invite links.

## Tech Stack

- **Framework**: Next.js 16 with App Router, Server Components, Server Actions
- **Database**: Supabase (Postgres with Row Level Security)
- **Auth**: Username-based (fake `username@internal.local` emails internally, Supabase Auth)
- **UI**: Tailwind CSS v4, shadcn/ui (New York style, Zinc theme), Recharts for charts
- **Theming**: next-themes for dark mode
- **Tokens**: nanoid for generating invite/submission tokens

## Key Commands

- `npm run dev` — Start dev server
- `npx next build` — Production build
- `vercel --prod` — Deploy to Vercel

## Architecture

### Auth Pattern
- `lib/queries/auth.ts` — Cached `getAuthContext()` using React `cache()` deduplicates auth lookups per request. All dashboard pages and server actions should use this instead of manual `getUser()` + leader + alliance queries.
- `lib/supabase/server.ts` — `createClient()` (anon, RLS-aware) and `createServiceClient()` (bypasses RLS)
- Service role client is only used where RLS cannot apply: signup/join (no leader row yet), unauthenticated submissions, unauthenticated player self-registration, admin password resets.

### Database
- Migrations in `supabase/migrations/` (001–005). Run in order in Supabase SQL editor.
- `get_my_alliance_id()` — `security definer` function that breaks circular RLS references on the leaders table.
- `player_latest_power` view with `security_invoker = on` for dashboard data.
- `compute_total_power` trigger auto-calculates total_power on power_entries.
- Columns use `numeric` type (not bigint) to support decimal values.

### Roles
- **R5** (boss): Full access — manage leaders, transfer R5, reset passwords, manage players
- **R4** (helper): Can manage players, view dashboard, change own password
- **Players**: Unauthenticated, submit power data via unique token links

### Number Format
- German locale support: comma as decimal separator (e.g., "32,12")
- `parsePower()` in `lib/actions/submissions.ts` handles both comma and dot
- `formatPower()` in `lib/utils.ts` uses `Intl.NumberFormat("de-DE")`

## Deployment

- Hosted on Vercel, database on Supabase
- Supabase Auth setting: "Confirm email" must be disabled (uses fake @internal.local emails)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
