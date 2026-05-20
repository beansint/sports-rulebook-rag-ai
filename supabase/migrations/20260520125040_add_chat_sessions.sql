create table if not exists public.chat_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sport text not null check (sport = lower(sport) and length(sport) between 2 and 32),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.queries
  add column if not exists session_id uuid references public.chat_sessions(id) on delete set null;

create index if not exists chat_sessions_user_idx on public.chat_sessions (user_id, created_at desc);
create index if not exists queries_session_idx on public.queries (session_id);

alter table public.chat_sessions enable row level security;

create policy "auth_read_own_sessions" on chat_sessions
  for select to authenticated using (user_id = auth.uid());

create policy "auth_insert_own_sessions" on chat_sessions
  for insert to authenticated with check (user_id = auth.uid());
