-- Allow leaders to update and delete power entries for their alliance's players
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
