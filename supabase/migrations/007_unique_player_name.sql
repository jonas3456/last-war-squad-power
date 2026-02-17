-- Prevent duplicate player names within the same alliance (case-insensitive)
create unique index idx_players_alliance_name
  on public.players (alliance_id, lower(name));
