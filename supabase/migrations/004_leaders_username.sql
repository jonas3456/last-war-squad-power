-- Add username column to leaders table to avoid N+1 admin API calls
alter table public.leaders add column username text not null default 'unknown';
