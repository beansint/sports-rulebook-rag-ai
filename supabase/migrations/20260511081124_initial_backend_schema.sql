create extension if not exists vector with schema extensions;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  sport text not null check (sport = lower(sport) and length(sport) between 2 and 32),
  season text not null,
  title text not null,
  source_url text,
  file_path text not null,
  pages integer check (pages is null or pages > 0),
  status text not null default 'active' check (status in ('active', 'archived', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport, season, file_path)
);

create table if not exists public.models (
  id text primary key,
  provider text not null,
  display_name text not null,
  enabled boolean not null default true,
  input_rate_per_m numeric(12, 6) not null default 0,
  output_rate_per_m numeric(12, 6) not null default 0,
  context_window integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key default 'global',
  default_model_id text not null references public.models(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = 'global')
);

create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  chunk_index integer not null check (chunk_index >= 0),
  text text not null,
  token_count integer check (token_count is null or token_count >= 0),
  embedding extensions.vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  sport text not null default 'nba',
  question text not null,
  answer text not null,
  latency_ms integer not null check (latency_ms >= 0),
  model_id text not null references public.models(id),
  provider text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  input_cost_usd numeric(14, 8) not null default 0,
  output_cost_usd numeric(14, 8) not null default 0,
  total_cost_usd numeric(14, 8) not null default 0,
  retrieved_chunks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.queries(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_id uuid not null references public.chunks(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  snippet text not null,
  score double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.queries(id) on delete cascade,
  rating integer not null check (rating in (1, 2)),
  comment text,
  created_at timestamptz not null default now(),
  unique (query_id)
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete set null,
  sport text not null,
  season text not null,
  title text not null,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  pages_processed integer not null default 0 check (pages_processed >= 0),
  chunks_created integer not null default 0 check (chunks_created >= 0),
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists documents_sport_season_idx on public.documents (sport, season);
create index if not exists chunks_document_page_idx on public.chunks (document_id, page_number);
create index if not exists queries_created_model_idx on public.queries (created_at desc, model_id);
create index if not exists citations_query_idx on public.citations (query_id);
create index if not exists ingestion_runs_status_idx on public.ingestion_runs (status, started_at desc);
create index if not exists chunks_embedding_hnsw_idx on public.chunks using hnsw (embedding extensions.vector_cosine_ops);

create or replace function public.match_chunks(
  query_embedding extensions.vector(1536),
  match_sport text,
  match_count integer default 8,
  match_threshold double precision default 0
)
returns table (
  chunk_id uuid,
  document_id uuid,
  sport text,
  season text,
  title text,
  page_number integer,
  chunk_index integer,
  content text,
  similarity double precision,
  file_path text
)
language sql stable
as $$
  select
    c.id as chunk_id,
    d.id as document_id,
    d.sport,
    d.season,
    d.title,
    c.page_number,
    c.chunk_index,
    c.text as content,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.file_path
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where d.sport = lower(match_sport)
    and d.status = 'active'
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.queries enable row level security;
alter table public.citations enable row level security;
alter table public.feedback enable row level security;
alter table public.models enable row level security;
alter table public.settings enable row level security;
alter table public.ingestion_runs enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rulebooks', 'rulebooks', false, 104857600, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.models (
  id,
  provider,
  display_name,
  enabled,
  input_rate_per_m,
  output_rate_per_m,
  context_window,
  metadata
)
values (
  'gpt-4.1-mini',
  'openai',
  'GPT-4.1 Mini',
  true,
  0.40,
  1.60,
  1047576,
  '{"pricingSource":"https://platform.openai.com/docs/pricing/"}'::jsonb
)
on conflict (id) do update set
  provider = excluded.provider,
  display_name = excluded.display_name,
  enabled = excluded.enabled,
  input_rate_per_m = excluded.input_rate_per_m,
  output_rate_per_m = excluded.output_rate_per_m,
  context_window = excluded.context_window,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.settings (id, default_model_id, metadata)
values ('global', 'gpt-4.1-mini', '{"embeddingModel":"text-embedding-3-small","embeddingDimensions":1536}'::jsonb)
on conflict (id) do update set
  default_model_id = excluded.default_model_id,
  metadata = excluded.metadata,
  updated_at = now();
