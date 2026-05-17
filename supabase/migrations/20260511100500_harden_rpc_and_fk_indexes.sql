create index if not exists citations_chunk_idx on public.citations (chunk_id);
create index if not exists citations_document_idx on public.citations (document_id);
create index if not exists ingestion_runs_document_idx on public.ingestion_runs (document_id);
create index if not exists queries_model_idx on public.queries (model_id);
create index if not exists queries_user_idx on public.queries (user_id);
create index if not exists settings_default_model_idx on public.settings (default_model_id);

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
set search_path = public, extensions
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
