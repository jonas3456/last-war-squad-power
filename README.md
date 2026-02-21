# Last War Squad Power Tracker

Track hero squad power levels for your Last War alliance. Leaders manage players and view dashboards; players submit data via tokenized invite links.

**Live:** [lw.410404.xyz](https://lw.410404.xyz) &nbsp;|&nbsp; **[GitHub](https://github.com/jonas3456/last-war-squad-power)** &nbsp;|&nbsp; **[User Guide](https://github.com/jonas3456/last-war-squad-power/blob/main/USER_GUIDE.md)** &nbsp;|&nbsp; [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Features

- **Username-based auth** — no email required, privacy-first
- **Role system** — R5 (alliance leader) and R4 (co-leaders) with different permissions
- **Player management** — add players manually or share a self-registration link
- **Tokenized submissions** — each player gets a unique link to submit squad power
- **Dashboard** — total power, averages, submission rates, strongest/weakest squad
- **History & charts** — track power trends over time per player
- **Leader management** — invite co-leaders, transfer R5, reset passwords
- **Edit/delete submissions** — leaders can correct or remove any entry
- **Interactive chart** — click legend items to show/hide individual squad lines
- **Unique player names** — duplicate names within an alliance are prevented
- **hCaptcha** — optional bot protection on login/signup (set `NEXT_PUBLIC_HCAPTCHA_SITEKEY`)
- **Dark mode** — toggle between light and dark themes
- **German locale** — supports comma as decimal separator (e.g. 32,12)
- **Mobile-friendly** — responsive sidebar with sheet navigation on mobile

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) [Vercel](https://vercel.com) account for deployment

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: enable hCaptcha bot protection
NEXT_PUBLIC_HCAPTCHA_SITEKEY=your-hcaptcha-site-key
```

To enable hCaptcha: add the site key above, then in Supabase Dashboard → Authentication → Settings → enable **hCaptcha** and enter your secret key.

### 3. Run database migrations

In the Supabase SQL Editor, run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` — Tables, indexes, triggers, helper functions
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_dashboard_view.sql` — Dashboard view

For existing installations, also run these additional migrations:

1. `supabase/migrations/004_leaders_username.sql` — Username denormalization
2. `supabase/migrations/005_alliance_leader_policies.sql` — Alliance/leader update policies
3. `supabase/migrations/006_power_entries_update_delete.sql` — Entry edit/delete policies
4. `supabase/migrations/007_unique_player_name.sql` — Unique player names per alliance (remove duplicates first)

### 4. Configure Supabase Auth

In Supabase Dashboard → Authentication → Settings:
- Ensure **Email provider** is enabled
- **Disable "Confirm email"** (the app uses internal placeholder emails)

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel (optional)

```bash
vercel --prod
```

Set the same environment variables in your Vercel project settings.

## Tech Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **Supabase** — Auth, Postgres, Row Level Security
- **Tailwind CSS v4** + shadcn/ui (New York style, Zinc theme)
- **Recharts** — Power history charts
- **TypeScript** — End-to-end type safety

## Project Structure

```
app/
  dashboard/           # Protected leader dashboard
    leaders/           # Leader management
    players/           # Player management
      [id]/history/    # Per-player power history
  join/[token]/        # Leader invite link
  register/[token]/    # Player self-registration
  submit/[token]/      # Player power submission
  login/               # Login page
  signup/              # Alliance creation
lib/
  actions/             # Server Actions (auth, players, leaders, entries, submissions)
  queries/             # Data fetching (cached auth, dashboard, players, leaders)
  supabase/            # Supabase client setup (anon + service role)
components/
  dashboard/           # Dashboard UI components
  auth/                # Login/signup forms
  submit/              # Submission form + history
  register/            # Player self-registration form
  ui/                  # shadcn/ui primitives
supabase/
  migrations/          # SQL migration files (001-007)
```

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
