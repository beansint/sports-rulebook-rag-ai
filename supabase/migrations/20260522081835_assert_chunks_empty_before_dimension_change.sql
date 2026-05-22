-- Assert chunks table is empty after the provider switch migration.
-- The previous migration (20260522055045_mistral_embeddings_1024dim) changed
-- the embedding column from vector(1536) to vector(1024). If any rows existed
-- at that point, pgvector would have silently truncated their dimensions.
-- This migration verifies the table is empty (no corrupt embeddings exist)
-- and establishes a tracked checkpoint in migration history.

do $$ begin
  if exists (select 1 from public.chunks limit 1) then
    raise exception
      'chunks table is not empty after dimension change — existing embeddings '
      'may have been silently truncated from 1536 to 1024 dimensions. '
      'Truncate chunks and citations, then re-ingest all rulebooks.';
  end if;
end $$;
