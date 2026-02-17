# Last War Alliance Power Tracker — Requirements for Claude Code

## Overview
Build a Next.js 14+ (App Router) application for tracking hero squad power levels 
of players in a Last War alliance. Leaders manage players and view dashboards; 
players submit their data via tokenized invite links. Deploy on Vercel with Supabase 
as the backend.

---

## Tech Stack
- **Framework:** Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL) with Row Level Security (RLS)
- **Auth:** Supabase Auth (email/password for leaders)
- **Hosting:** Vercel
- **UI:** shadcn/ui component library
- **State/Fetching:** React Server Components where possible, Server Actions for mutations

---

## Data Model (Supabase / Postgres)

### `alliances`
| Column       | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | default gen_random_uuid()    |
| name        | text      | Alliance name                |
| created_at  | timestamptz | default now()              |

### `leaders`
| Column       | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | References Supabase auth.users.id |
| alliance_id | uuid (FK) | References alliances.id      |
| display_name| text      |                              |
| created_at  | timestamptz | default now()              |

### `players`
| Column       | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | default gen_random_uuid()    |
| alliance_id | uuid (FK) | References alliances.id      |
| name        | text      | Player's in-game name        |
| token       | text      | Unique, URL-safe token for invite link |
| created_at  | timestamptz | default now()              |

### `power_entries`
| Column       | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | default gen_random_uuid()    |
| player_id   | uuid (FK) | References players.id        |
| squad_1     | numeric   | Power in millions (e.g. 32.12) |
| squad_2     | numeric   | Power in millions (e.g. 22.03) |
| squad_3     | numeric   | Power in millions (e.g. 21.03) |
| squad_4     | numeric   | Nullable — some players have only 3 squads |
| total_power | numeric   | Generated/computed: sum of squad_1..4 |
| submitted_at| timestamptz | default now()              |

> Store power as a decimal number in millions (e.g., `32.12` = 32.12M).
> `total_power` should be computed on insert/update via a Postgres trigger or 
> calculated in the application layer before saving.

---

## Core Features

### 1. Leader Authentication
- Sign up / log in with email and password via Supabase Auth.
- On first sign-up, the leader creates an alliance (name input).
- Future leaders can be invited to the same alliance (stretch goal — not MVP).
- Protected routes under `/dashboard/*`.

### 2. Leader Dashboard (`/dashboard`)
- **Player table** showing all players in the alliance:
  - Columns: Player Name | Squad 1 | Squad 2 | Squad 3 | Squad 4 | Total Power | Last Updated
  - Power values displayed formatted, e.g., "32.12M"
  - Rows color-coded or flagged if a player hasn't submitted data yet (no entries)
  - Rows also flagged if data is older than 7 days (stale)
- **Sorting:** Click column headers to sort ascending/descending on any column
- **Filtering:**
  - Search by player name (text input)
  - Filter: "All" / "Has data" / "No data" / "Stale (>7 days)"
- **Summary stats at the top:**
  - Total alliance power (sum of all latest total_power)
  - Average player power
  - Number of players who have submitted / total players
  - Strongest & weakest squad across the alliance

### 3. Player Management (`/dashboard/players`)
- **Add Player:** Form with just the player name. System auto-generates a unique token.
- **Player List:** Table of all players with:
  - Name
  - Invite link (with copy-to-clipboard button)
  - Date created
  - Last submission date
  - Actions: Edit name, Delete player (with confirmation), Regenerate token
- **Invite Link Format:** `{BASE_URL}/submit/{token}`
- **Bulk actions (nice to have):** Delete multiple players

### 4. Player Submission Page (`/submit/[token]`)
- **No login required** — the token in the URL is the auth.
- Validate token on page load. Show 404/error if invalid.
- Display the player's name at the top: "Welcome, [Player Name]"
- **Form fields:**
  - Squad 1 Power (required, numeric input, step 0.01)
  - Squad 2 Power (required, numeric input, step 0.01)
  - Squad 3 Power (required, numeric input, step 0.01)
  - Squad 4 Power (optional, numeric input, step 0.01)
  - All inputs labeled with "Power in millions" helper text
- **Pre-fill** with the player's most recent submission so they can just update what changed.
- On submit: create a new `power_entries` row (don't overwrite — we want history).
- Show success message with the submitted values summarized.

### 5. Player History (`/dashboard/players/[id]/history`)
- Accessible by leaders from the dashboard.
- Table/chart showing all `power_entries` for that player, ordered by date.
- **Line chart** (use recharts or chart.js) showing power over time:
  - One line per squad + one line for total
  - X-axis: date, Y-axis: power in millions
- Table below with all raw entries and timestamps.

### 6. Alliance History / Trends (`/dashboard/trends`) — Nice to Have
- Line chart of total alliance power over time (weekly snapshots or per-submission)
- Average squad power trends

---

## UX / Design Requirements
- **Responsive:** Must work well on mobile (players will likely submit from phones).
- **Dark mode support** via Tailwind + shadcn/ui theme toggle.
- **Clean, minimal UI.** Think: utility dashboard, not flashy game site.
- Use shadcn/ui components: Table, Card, Button, Input, Dialog, Toast, Badge.
- **Toast notifications** for success/error feedback on all actions.
- **Loading states** with skeleton loaders for data fetching.

---

## Security
- Enable Supabase RLS:
  - Leaders can only read/write players and entries in their own alliance.
  - The `/submit/[token]` route uses a Supabase service role or an anon policy 
    that allows inserts to `power_entries` only if the token matches a valid player.
- Tokens should be cryptographically random (e.g., `crypto.randomUUID()` or nanoid).
- Rate-limit submissions from the same token (max 1 per 5 minutes) — 
  can be app-level middleware or Supabase function.

---

## Project Structure
```
/app
  /layout.tsx              — Root layout with providers (theme, supabase)
  /page.tsx                — Landing / redirect to dashboard or login
  /login/page.tsx          — Leader login
  /signup/page.tsx         — Leader signup + alliance creation
  /submit/[token]/page.tsx — Player submission form (public)
  /dashboard
    /layout.tsx            — Dashboard layout with sidebar/nav (protected)
    /page.tsx              — Main overview dashboard
    /players/page.tsx      — Player management
    /players/[id]/history/page.tsx — Player power history
    /trends/page.tsx       — Alliance trends (nice to have)
/components
  /ui/                     — shadcn/ui components
  /dashboard/              — Dashboard-specific components
  /submit/                 — Submission form components
/lib
  /supabase/
    /client.ts             — Browser Supabase client
    /server.ts             — Server Supabase client
    /middleware.ts          — Auth middleware
  /utils.ts                — Formatting helpers (e.g., formatPower)
  /types.ts                — TypeScript types matching DB schema
/supabase
  /migrations/             — SQL migration files for the schema
```

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Setup Instructions to Generate
Include a `README.md` with:
1. Prerequisites (Node 18+, Supabase project)
2. How to set up Supabase (run migrations)
3. How to configure env vars
4. `npm install && npm run dev`
5. How to deploy to Vercel

---

## MVP Scope (build this first)
1. Leader auth (signup/login)
2. Alliance creation on signup
3. Player CRUD with token generation and invite link copy
4. Player submission form at `/submit/[token]`
5. Dashboard table with sorting and filtering
6. Player history page with chart

## Stretch Goals (after MVP)
- Alliance trends page
- Multiple leaders per alliance (invite leader flow)
- Export dashboard to CSV
- Bulk player import
- Push notifications / reminders for stale data
- Multi-alliance support (leader can switch between alliances)
