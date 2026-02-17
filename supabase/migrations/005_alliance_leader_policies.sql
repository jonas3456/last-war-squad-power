-- Allow leaders to update their own alliance (for invite token regeneration)
create policy "Leaders can update own alliance"
  on public.alliances for update
  using (
    id = public.get_my_alliance_id()
  );


-- Allow leaders to update leaders in their alliance (for role changes)
create policy "Leaders can update alliance leaders"
  on public.leaders for update
  using (
    alliance_id = public.get_my_alliance_id()
  );

-- Allow leaders to delete leaders in their alliance (for removing helpers)
create policy "Leaders can delete alliance leaders"
  on public.leaders for delete
  using (
    alliance_id = public.get_my_alliance_id()
  );
