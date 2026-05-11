# SportRules AI Implementation Spec

## Current Build Phase

Backend MVP foundation is implemented. The product source of truth remains `doc/PRD.md`; scraping/source acquisition remains `doc/scraping-pipeline.md`.

This document tracks implementation decisions, live infrastructure, API contracts, verification status, and known gaps as the project is built.

## Supabase Project

- Organization: `VBP Org` (`dtcsjabiyondyzebbiae`)
- Project name: `sportrules-ai`
- Project ref: `mzlyblyegxxkexldstha`
- Region: `ap-southeast-1`
- Project URL: `https://mzlyblyegxxkexldstha.supabase.co`
- Storage bucket: `rulebooks` (private)
- GitHub repository: `https://github.com/beansint/sports-rulebook-rag-ai`
- Project cost confirmation: `$0/month` reported by Supabase before creation

## Environment Contract

Required server-side variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for API routes and ingestion. Never expose to the browser.
- `OPENAI_API_KEY`: OpenAI key for embeddings and answer generation.
- `ADMIN_API_KEY`: Shared admin secret accepted via `x-admin-key` for v1 admin routes.

Optional variables:

- `EMBEDDING_MODEL`: Defaults to `text-embedding-3-small`.
- `DEFAULT_CHAT_MODEL`: Optional fallback if DB settings are unavailable; defaults to `gpt-4.1-mini`.

Client-side public keys are intentionally deferred until the UI slice. Backend MVP route handlers use server-side Supabase access only.

## Database Schema Summary

Applied database foundation:

- Enable `vector` extension for pgvector retrieval.
- `documents`: one row per rulebook PDF with sport, season, storage file path, source URL, page count, and status metadata.
- `chunks`: extracted rulebook text chunks with page number, chunk index, token estimate, and `vector(1536)` embedding.
- `queries`: query/answer log with model, provider, latency, token usage, and cost fields.
- `citations`: links logged queries to retrieved chunks and stores score/snippet/page data.
- `feedback`: thumbs up/down plus optional comment per query.
- `models`: model registry with provider, enabled flag, pricing rates, and context window.
- `settings`: global config, initially `default_model_id`.
- `ingestion_runs`: ingestion status, counts, and errors for admin visibility.
- `match_chunks`: RPC for sport-filtered vector similarity retrieval.

Migration history:

- `20260511095907_initial_backend_schema`: applied in Supabase and saved locally at `supabase/migrations/20260511081124_initial_backend_schema.sql`.
- `20260511100610_harden_rpc_and_fk_indexes`: applied in Supabase and saved locally at `supabase/migrations/20260511100500_harden_rpc_and_fk_indexes.sql`.

## API Contracts

### `POST /api/ingest`

Admin-only. Requires `x-admin-key`.

Request:

```json
{
  "sport": "nba",
  "season": "2025-26",
  "title": "Official 2025-26 NBA Playing Rules",
  "fileUrl": "https://<project>.supabase.co/storage/v1/object/rulebooks/raw/sport/nba/2025-26/nba-official-playing-rules-2025-26.pdf",
  "sourceUrl": "https://ak-static.cms.nba.com/wp-content/uploads/sites/4/2025/10/Official-2025-26-NBA-Playing-Rules.pdf"
}
```

Behavior:

- Rejects non-Supabase storage URLs.
- Downloads from the private `rulebooks` bucket through the server Supabase client.
- Extracts PDF text, chunks by page-aware windows, embeds with `text-embedding-3-small`, stores document and chunks, and records an ingestion run.

Response:

```json
{
  "documentId": "uuid",
  "pagesProcessed": 76,
  "chunksCreated": 120
}
```

### `POST /api/chat`

Public.

Request:

```json
{
  "question": "Is it a violation to hang on the rim after a dunk?",
  "sport": "nba",
  "modelId": "gpt-4.1-mini"
}
```

Behavior:

- Embeds the question.
- Retrieves top chunks with `match_chunks` filtered by sport.
- Uses `settings.default_model_id` for public requests.
- Honors `modelId` only when the request has a valid admin key.
- Generates an answer constrained to retrieved rulebook text.
- Logs query, citations, usage, latency, and estimated cost.

Response includes `answer`, `citations`, `model`, `usage`, `latencyMs`, and `queryId`.

### `GET /api/models`

Admin-only. Returns all model rows and the current default model id.

### `POST /api/models`

Admin-only. Upserts model metadata, toggles enabled status, and can set the default model.

### `POST /api/feedback`

Public. Records `{ queryId, rating, comment? }`, where `rating` is `1` for down and `2` for up.

## RAG Pipeline Flow

1. Scraped PDFs are uploaded to private Supabase Storage at `rulebooks/raw/sport/{sport}/{season}/{filename}`.
2. Admin calls `/api/ingest` with a Supabase storage URL.
3. API extracts text page-by-page, normalizes whitespace, chunks with overlap, and stores source metadata.
4. API embeds chunks with `text-embedding-3-small` and writes `chunks.embedding` as `vector(1536)`.
5. Chat requests embed the question and call `match_chunks` for sport-filtered retrieval.
6. The LLM receives only retrieved context and must abstain when the context does not cover the answer.
7. Query, citations, token usage, estimated cost, and latency are logged.

## Model Registry Defaults

Initial defaults:

- Embedding model: `text-embedding-3-small`, 1536 dimensions.
- Default chat model: `gpt-4.1-mini`.
- Provider: `openai`.
- Pricing seed: `$0.40/M` input tokens and `$1.60/M` output tokens.

Pricing source: https://platform.openai.com/docs/pricing/

## Security Decisions

- Admin gates use `x-admin-key` compared against `ADMIN_API_KEY` for v1.
- Supabase service role access is restricted to server route handlers.
- `rulebooks` bucket is private; no public storage policy is created in the backend MVP.
- Chat is public but writes logs through server-side service-role access.
- Model override is admin-only; non-admin callers always use the DB default.
- RLS is enabled on application tables with no public client policies in the backend MVP.

## Verification Checklist

- [x] Supabase project created.
- [x] Initial migration applied.
- [x] Hardening migration applied for RPC search path and foreign-key indexes.
- [x] `rulebooks` private storage bucket exists.
- [x] Seed `gpt-4.1-mini` model exists and is default.
- [x] `match_chunks` RPC exists.
- [x] Supabase security advisor reviewed.
- [x] Supabase performance advisor reviewed.
- [x] API routes reject missing admin key where required.
- [x] `/api/ingest` rejects external league CDN URLs.
- [x] `pnpm run typecheck` passes.
- [x] `pnpm build` passes.

Advisor notes:

- Security advisor still reports `RLS Enabled No Policy` info findings on application tables. This is intentional for the backend MVP because route handlers use the service role and no browser/client DB access is exposed yet.
- Performance advisor still reports `Unused Index` info findings. This is expected on an empty database with no workload history.

Smoke test results:

- `GET /api/models` without `x-admin-key`: `401`, `{ "error": "Admin API key required" }`.
- `POST /api/ingest` with valid admin key but external NBA CDN `fileUrl`: `400`, `{ "error": "fileUrl must point to this Supabase project, not an external source" }`.

## Known Gaps

- Local scraped PDFs are ignored by git and are not present in this checkout.
- Full chat UI, PDF viewer, admin dashboard, and eval harness are intentionally deferred.
- Service-role key must be copied into `.env.local` manually before local API smoke tests can call Supabase.
- End-to-end ingestion/chat still requires real `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and uploaded PDFs in the private `rulebooks` bucket.
- The model registry schema can store multiple providers, but the backend MVP only implements the OpenAI generation adapter. Non-OpenAI enabled models return `501` until provider adapters are added.
