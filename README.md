# Last War Squad Power Tracker

Track hero squad power levels for your Last War alliance. Leaders manage players and view dashboards; players submit data via tokenized invite links.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run database migrations

In the Supabase SQL Editor, run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` — Tables, indexes, triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_dashboard_view.sql` — Dashboard view

### 4. Enable Email Auth

In Supabase Dashboard → Authentication → Providers, ensure Email provider is enabled.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Sign up** — Creates your account, alliance, and leader record
2. **Add players** — Go to Players page, add players by name
3. **Share invite links** — Copy the unique invite link for each player
4. **Players submit** — Players open their link and enter squad power values
5. **View dashboard** — See total power, averages, and per-player breakdowns
6. **Track history** — Click the history icon to see power trends over time

## Tech Stack

- **Next.js 16** (App Router, Server Actions)
- **Supabase** (Auth, Postgres, RLS)
- **Tailwind CSS v4** + shadcn/ui components
- **Recharts** for power history charts
- **TypeScript** throughout
