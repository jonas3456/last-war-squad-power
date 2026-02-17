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

-- Indexes
create index idx_players_token on public.players(token);
create index idx_players_alliance_id on public.players(alliance_id);
create index idx_power_entries_player_id on public.power_entries(player_id);
create index idx_power_entries_submitted_at on public.power_entries(submitted_at desc);

-- Trigger to auto-compute total_power
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

-- Trigger to update updated_at on players
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
