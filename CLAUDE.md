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
    
### Entry Management
- `lib/actions/entries.ts` — `leaderUpdateEntry` / `leaderDeleteEntry` / `leaderAddEntry` server actions for the history page
- `parsePower()` is duplicated in `entries.ts` (not only in `submissions.ts`) — consider consolidating into `lib/utils.ts` if touching either file
- `power_entries` RLS INSERT policy exists for leaders — player submissions from `/submit/[token]` still use service role client to bypass RLS
- `player_latest_power` view only exposes the most recent entry per player — fetching the previous entry requires a separate query on `power_entries`

### Auth Pattern
- `lib/queries/auth.ts` — Cached `getAuthContext()` using React `cache()` deduplicates auth lookups per request. All dashboard pages and server actions should use this instead of manual `getUser()` + leader + alliance queries.
- `lib/supabase/server.ts` — `createClient()` (anon, RLS-aware) and `createServiceClient()` (bypasses RLS)
- Service role client is only used where RLS cannot apply: signup/join (no leader row yet), unauthenticated submissions, unauthenticated player self-registration, admin password resets.

### Database
- Single consolidated migration in `supabase/migrations/`. Applied automatically via `supabase db push` during build. New migrations use timestamp prefix format (`YYYYMMDDHHmmss_name.sql`).
- `get_my_alliance_id()` — `security definer` function that breaks circular RLS references on the leaders table.
- `player_latest_power` view with `security_invoker = on` for dashboard data.
- Supabase linter may flag the view as "Security Definer" — this is a false positive; `security_invoker = on` is already set.
- `compute_total_power` trigger auto-calculates total_power on power_entries.
- Columns use `numeric` type (not bigint) to support decimal values.
- Unique constraint on `(alliance_id, lower(name))` prevents duplicate player names. Postgres error code `23505` = unique violation.

### Charts (Recharts)
- CSS variables in this project use `oklch()` not `hsl()` — never wrap them in `hsl(var(...))` in Recharts props, use `var(--color-*)` directly or hardcode hex colors.
- Recharts `formatter` prop requires `(value: any)` cast to satisfy TypeScript.

### Roles
- **R5** (boss): Full access — manage leaders, transfer R5, reset passwords, manage players
- **R4** (helper): Can manage players, view dashboard, change own password
- **Players**: Unauthenticated, submit power data via unique token links

### Number Format
- German locale support: comma as decimal separator (e.g., "32,12")
- `parsePower()` in `lib/actions/submissions.ts` handles both comma and dot
- `formatPower()` in `lib/utils.ts` uses `Intl.NumberFormat("de-DE")`

### hCaptcha
- Opt-in: only active when `NEXT_PUBLIC_HCAPTCHA_SITEKEY` is set — widget is not rendered otherwise.
- Token generated client-side, injected as a hidden `captchaToken` form field, read in server actions and forwarded to Supabase Auth.
- Use `useTheme()` from `next-themes` to pass `theme="dark"|"light"` to the `<HCaptcha>` component.
- Must also enable hCaptcha in Supabase Dashboard → Authentication → Settings with the secret key.

## Deployment

- Hosted on Vercel, database on Supabase
- `git push` to `main` triggers a production deployment — always ask the user before pushing
- Supabase migrations run automatically during `npm run build` via `supabase db push`
- Supabase Auth setting: "Confirm email" must be disabled (uses fake @internal.local emails)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- `SUPABASE_DB_URL` — Postgres connection string from Supabase Dashboard → Settings → Database → Connection string (URI). Used by `supabase db push` at build time.
- `SUPABASE_DB_URL` must use the **session mode pooler** URL (`aws-0-*.pooler.supabase.com:5432`), not the direct connection — direct resolves to IPv6 which may not be routable.
- `supabase migration repair --status applied <version> --db-url $SUPABASE_DB_URL` — marks a migration as applied without running it (for existing databases)
- `vercel env pull --environment production /tmp/file` — temporarily pull prod env vars; use `printf` (not `echo`) when piping values into `vercel env add` to avoid trailing newlines
