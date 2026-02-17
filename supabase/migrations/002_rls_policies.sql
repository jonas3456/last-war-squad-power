-- Enable RLS on all tables
alter table public.alliances enable row level security;
alter table public.leaders enable row level security;
alter table public.players enable row level security;
alter table public.power_entries enable row level security;

-- Alliances: leaders can read and update their own alliance
create policy "Leaders can view own alliance"
  on public.alliances for select
  using (
    id = public.get_my_alliance_id()
  );

create policy "Leaders can update own alliance"
  on public.alliances for update
  using (
    id = public.get_my_alliance_id()
  );

-- Leaders: can view, update, and delete leaders in the same alliance
create policy "Leaders can view alliance leaders"
  on public.leaders for select
  using (
    alliance_id = public.get_my_alliance_id()
  );

create policy "Leaders can update alliance leaders"
  on public.leaders for update
  using (
    alliance_id = public.get_my_alliance_id()
  );

create policy "Leaders can delete alliance leaders"
  on public.leaders for delete
  using (
    alliance_id = public.get_my_alliance_id()
  );

-- Players: leaders can CRUD players in their alliance
create policy "Leaders can view alliance players"
  on public.players for select
  using (
    alliance_id = public.get_my_alliance_id()
  );

create policy "Leaders can insert alliance players"
  on public.players for insert
  with check (
    alliance_id = public.get_my_alliance_id()
  );

create policy "Leaders can update alliance players"
  on public.players for update
  using (
    alliance_id = public.get_my_alliance_id()
  );

create policy "Leaders can delete alliance players"
  on public.players for delete
  using (
    alliance_id = public.get_my_alliance_id()
  );

-- Power entries: leaders can read, update, and delete entries for their alliance's players
create policy "Leaders can view alliance power entries"
  on public.power_entries for select
  using (
    player_id in (
      select id from public.players
      where alliance_id = public.get_my_alliance_id()
    )
  );

create policy "Leaders can update alliance power entries"
  on public.power_entries for update
  using (
    player_id in (
      select id from public.players
      where alliance_id = public.get_my_alliance_id()
    )
  );

create policy "Leaders can delete alliance power entries"
  on public.power_entries for delete
  using (
    player_id in (
      select id from public.players
      where alliance_id = public.get_my_alliance_id()
    )
  );

-- Note: Power entry inserts from /submit/[token] use service role client which bypasses RLS.
