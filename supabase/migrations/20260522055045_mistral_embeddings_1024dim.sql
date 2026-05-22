-- Switch embedding provider from OpenAI text-embedding-3-small (1536-dim)
-- to Mistral mistral-embed (1024-dim).
--
-- Requires a full re-ingest after deployment — existing chunk embeddings are
-- incompatible across providers regardless of dimension.

-- Make pgvector operators available for this migration session
set search_path to public, extensions;

-- Drop the HNSW index before altering the column type (Postgres requirement)
drop index if exists public.chunks_embedding_hnsw_idx;

-- Change embedding column dimension: 1536 → 1024
alter table public.chunks alter column embedding type extensions.vector(1024);

-- Recreate HNSW index for cosine similarity
create index chunks_embedding_hnsw_idx
  on public.chunks using hnsw (embedding extensions.vector_cosine_ops);

-- Update match_chunks RPC signature to accept 1024-dim query vector
create or replace function public.match_chunks(
  query_embedding extensions.vector(1024),
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

-- Record new embedding provider in settings metadata
update public.settings
set
  metadata = metadata
    || '{"embeddingModel":"mistral-embed","embeddingDimensions":1024}'::jsonb,
  updated_at = now()
where id = 'global';
