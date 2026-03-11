-- Fix mutable search_path warning for trigger functions.
-- Without a fixed search_path, a user could shadow public schema objects.

create or replace function public.compute_total_power()
returns trigger as $$
begin
  new.total_power := new.squad1 + new.squad2 + new.squad3 + new.squad4;
  return new;
end;
$$ language plpgsql
   set search_path = public;

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql
   set search_path = public;
