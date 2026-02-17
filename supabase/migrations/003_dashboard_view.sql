-- View: latest power entry per player
create or replace view public.player_latest_power as
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
