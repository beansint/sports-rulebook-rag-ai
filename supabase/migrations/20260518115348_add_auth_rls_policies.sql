-- RLS policies for auth-gated tables.
--
-- All DB writes go through the service role (bypasses RLS), so these
-- policies only constrain anon/user-key access as a defence-in-depth
-- measure. The chat and feedback API routes are protected at the
-- middleware/route-handler level; RLS provides a second layer.

-- ── documents: authenticated users can read ──────────────────────────────
create policy "auth_read_documents"
  on documents
  for select
  to authenticated
  using (true);

-- ── chunks: authenticated users can read ─────────────────────────────────
create policy "auth_read_chunks"
  on chunks
  for select
  to authenticated
  using (true);

-- ── queries: users can only read their own rows ───────────────────────────
create policy "auth_read_own_queries"
  on queries
  for select
  to authenticated
  using (user_id = auth.uid());

-- ── feedback: users can insert and read their own feedback ────────────────
-- "Own" is determined by ownership of the parent query.
create policy "auth_insert_feedback"
  on feedback
  for insert
  to authenticated
  with check (
    exists (
      select 1 from queries
      where queries.id = feedback.query_id
        and queries.user_id = auth.uid()
    )
  );

create policy "auth_read_own_feedback"
  on feedback
  for select
  to authenticated
  using (
    exists (
      select 1 from queries
      where queries.id = feedback.query_id
        and queries.user_id = auth.uid()
    )
  );

-- models, settings, ingestion_runs: no direct client access.
-- Service role only — no policies added.
