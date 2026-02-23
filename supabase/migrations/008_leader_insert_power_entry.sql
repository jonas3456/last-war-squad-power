-- Allow leaders to manually insert power entries for players in their alliance
create policy "Leaders can insert alliance power entries"
  on public.power_entries for insert
  with check (
    player_id in (
      select id from public.players
      where alliance_id = public.get_my_alliance_id()
    )
  );
