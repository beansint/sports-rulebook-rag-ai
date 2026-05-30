create table public.keepalive (
  id bigint primary key generated always as identity,
  pinged_at timestamptz not null default now()
);
