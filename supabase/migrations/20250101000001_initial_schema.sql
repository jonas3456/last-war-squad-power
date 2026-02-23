-- ============================================================
-- Schema
-- ============================================================

-- Alliances table
create table public.alliances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_token text unique,
  player_invite_token text unique,
  created_at timestamptz not null default now()
);

-- Leaders table (links auth users to alliances)
create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  role text not null default 'boss',
  username text not null default 'unknown',
  created_at timestamptz not null default now(),
  unique(user_id, alliance_id)
);

-- Players table
create table public.players (
  id uuid primary key default gen_random_uuid(),
  alliance_id uuid not null references public.alliances(id) on delete cascade,
  name text not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Power entries table
create table public.power_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  squad1 numeric not null default 0,
  squad2 numeric not null default 0,
  squad3 numeric not null default 0,
  squad4 numeric not null default 0,
  total_power numeric not null default 0,
  submitted_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_players_token on public.players(token);
create index idx_players_alliance_id on public.players(alliance_id);
create unique index idx_players_alliance_name on public.players(alliance_id, lower(name));
create index idx_power_entries_player_id on public.power_entries(player_id);
create index idx_power_entries_submitted_at on public.power_entries(submitted_at desc);

-- ============================================================
-- Triggers & Functions
-- ============================================================

-- Auto-compute total_power on insert/update
create or replace function public.compute_total_power()
returns trigger as $$
begin
  new.total_power := new.squad1 + new.squad2 + new.squad3 + new.squad4;
  return new;
end;
$$ language plpgsql;

create trigger trg_compute_total_power
  before insert or update on public.power_entries
  for each row
  execute function public.compute_total_power();

-- Auto-update updated_at on players
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_players_updated_at
  before update on public.players
  for each row
  execute function public.update_updated_at();

-- Helper function for RLS (avoids circular reference on leaders table)
create or replace function public.get_my_alliance_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select alliance_id from public.leaders where user_id = auth.uid() limit 1;
$$;

-- ============================================================
-- Views
-- ============================================================

-- Latest power entry per player (security_invoker ensures RLS applies)
create or replace view public.player_latest_power
  with (security_invoker = on)
as
select distinct on (p.id)
  p.id,
  p.alliance_id,
  p.name,
  p.token,
  p.created_at,
  p.updated_at,
  pe.squad1,
  pe.squad2,
  pe.squad3,
  pe.squad4,
  pe.total_power,
  pe.submitted_at
from public.players p
left join public.power_entries pe on pe.player_id = p.id
order by p.id, pe.submitted_at desc nulls last;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.alliances enable row level security;
alter table public.leaders enable row level security;
alter table public.players enable row level security;
alter table public.power_entries enable row level security;

-- Alliances: leaders can read and update their own alliance
create policy "Leaders can view own alliance"
  on public.alliances for select
  using (id = public.get_my_alliance_id());

create policy "Leaders can update own alliance"
  on public.alliances for update
  using (id = public.get_my_alliance_id());

-- Leaders: can view, update, and delete leaders in the same alliance
create policy "Leaders can view alliance leaders"
  on public.leaders for select
  using (alliance_id = public.get_my_alliance_id());

create policy "Leaders can update alliance leaders"
  on public.leaders for update
  using (alliance_id = public.get_my_alliance_id());

create policy "Leaders can delete alliance leaders"
  on public.leaders for delete
  using (alliance_id = public.get_my_alliance_id());

-- Players: leaders can CRUD players in their alliance
create policy "Leaders can view alliance players"
  on public.players for select
  using (alliance_id = public.get_my_alliance_id());

create policy "Leaders can insert alliance players"
  on public.players for insert
  with check (alliance_id = public.get_my_alliance_id());

create policy "Leaders can update alliance players"
  on public.players for update
  using (alliance_id = public.get_my_alliance_id());

create policy "Leaders can delete alliance players"
  on public.players for delete
  using (alliance_id = public.get_my_alliance_id());

-- Power entries: leaders can CRUD entries for their alliance's players
-- Note: player submissions from /submit/[token] use service role client which bypasses RLS.
create policy "Leaders can view alliance power entries"
  on public.power_entries for select
  using (player_id in (select id from public.players where alliance_id = public.get_my_alliance_id()));

create policy "Leaders can insert alliance power entries"
  on public.power_entries for insert
  with check (player_id in (select id from public.players where alliance_id = public.get_my_alliance_id()));

create policy "Leaders can update alliance power entries"
  on public.power_entries for update
  using (player_id in (select id from public.players where alliance_id = public.get_my_alliance_id()));

create policy "Leaders can delete alliance power entries"
  on public.power_entries for delete
  using (player_id in (select id from public.players where alliance_id = public.get_my_alliance_id()));
