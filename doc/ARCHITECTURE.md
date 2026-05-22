# Architecture

## System Overview

SportRules AI is a Next.js App Router application backed by Supabase. All compute runs on Vercel (Hobby), all data lives in Supabase (Free tier). There is no separate backend service — API routes and server components handle everything server-side.

```
Browser
  │
  ├── GET /               Landing page (public)
  ├── GET /login          Login form (public)
  ├── GET /chat           Chat UI (auth required)
  ├── GET /admin/users    Admin user management (owner only)
  │
  └── API routes (Next.js Route Handlers)
        ├── POST /api/chat      RAG pipeline (auth required)
        ├── POST /api/feedback  Feedback store (auth required)
        ├── POST /api/ingest    PDF ingestion (x-admin-key)
        ├── GET  /api/models          Model registry (x-admin-key)
        ├── POST /api/models          Model registry (x-admin-key)
        └── GET  /api/models/enabled  Enabled models list (auth required)
```

---

## Route Protection

Middleware (`proxy.ts`) intercepts every request to `/chat/*` and `/admin/*`:

```
Request → proxy.ts
  ├── No session cookie → redirect /login?next=<path>
  ├── /admin/* + user.email ≠ ADMIN_EMAIL → 403
  └── Valid session → pass through
```

Session validation uses `supabase.auth.getUser()` (server-to-Supabase check) — never trusts client-provided JWTs. The `ADMIN_EMAIL` env var is server-only (no `NEXT_PUBLIC_` prefix).

API routes (`/api/chat`, `/api/feedback`) independently validate the session cookie and return 401 if absent. The programmatic admin routes (`/api/ingest`, `/api/models`) use a separate `x-admin-key` header check, kept independent of cookie auth so they can be called from scripts and CI.

---

## RAG Pipeline

```
User question (string)
        │
        ▼
  embedText()                     ← lib/embeddings.ts
  Embedding provider (default: OpenAI text-embedding-3-small)
  → 1536-dim float vector
        │
        ▼
  retrieveChunks()                ← lib/rag.ts
  pgvector cosine similarity      ← match_chunks RPC
  filtered by sport column
  → top-k chunks (default 8)
        │
        ▼
  generateAnswer()                ← lib/generation.ts
  context-constrained prompt:
    - system: "answer only from the provided rule text"
    - user: question + formatted chunks
  → {answer, usage, costFields}
        │
        ▼
  insert queries + citations rows ← app/api/chat/route.ts
        │
        ▼
  return {queryId, answer, citations, model, usage, latencyMs}
```

If the answer isn't in the retrieved chunks, the model is instructed to respond "I don't know / not covered by the rulebook."

---

## Ingestion Pipeline

```
POST /api/ingest { fileUrl, sport, season }
        │
        ▼
  download PDF from Supabase Storage
        │
        ▼
  extractPdfPages()               ← lib/pdf.ts
  pdf-parse with pagerender hook
  → [{pageNumber, text}]
        │
        ▼
  chunkPages()                    ← lib/chunking.ts
  512–1024 token chunks
  120 token overlap
  → [{text, pageNumber, chunkIndex}]
        │
        ▼
  embedText() per chunk           ← lib/embeddings.ts
  → 1536-dim vector per chunk
        │
        ▼
  upsert documents row
  batch insert chunks rows        ← Supabase service role client
  update ingestion_runs log
```

`fileUrl` must reference a file in Supabase Storage. External CDN URLs (e.g., `cdn.nba.com`) are stored as `source_url` metadata only and never passed to ingest directly.

---

## Model Registry

The `models` table is the source of truth for available LLMs:

```
models
  id              TEXT PK    -- model name string, e.g. "gpt-4.1-mini"
  provider        TEXT       -- "openai" | "cerebras" | "groq" | "mistral" | "nvidia"
  enabled         BOOLEAN
  input_rate_per_m  NUMERIC  -- USD per 1M input tokens
  output_rate_per_m NUMERIC  -- USD per 1M output tokens

settings
  key             TEXT PK
  value           TEXT       -- e.g. default_model_id = "gpt-4.1-mini"
```

At query time, `selectModel()` (`lib/models.ts`) resolves the model: any authenticated user may request an `enabled = true` model by passing `modelId` in the chat payload; admins may additionally request disabled models. If no `modelId` is supplied, `settings.default_model_id` is used.

The chat UI exposes a model selector (fetched from `GET /api/models/enabled`) that persists the user's choice in `localStorage` under `sportrules:model`.

Cost is computed from the rates at query time and stored on the `queries` row.

### Embedding provider

Embeddings and generation use **independent** providers:

| Layer | Provider | Env var |
|-------|----------|---------|
| Embeddings | Mistral `mistral-embed` (default) | `EMBEDDING_API_KEY` + optional `EMBEDDING_BASE_URL` |
| Generation | Per `model.provider` in the registry | `CEREBRAS_API_KEY` / `OPENAI_API_KEY` / etc. |

The `chunks.embedding` column is `vector(1024)`, sized for `mistral-embed`. Mistral is OpenAI-compatible — `EMBEDDING_BASE_URL` defaults to `https://api.mistral.ai/v1`. Sign up free at console.mistral.ai (no credit card).

**Switching embedding providers requires:**
1. A DB migration changing the column to the new dimension
2. A full re-ingest of all rulebook PDFs

**Local dev with Ollama (free, M2-native):**
```bash
brew install ollama
ollama pull nomic-embed-text   # 274 MB, 768-dim
ollama serve
```
Then in `.env.local`:
```
EMBEDDING_BASE_URL=http://localhost:11434/v1
EMBEDDING_API_KEY=ollama
EMBEDDING_MODEL=nomic-embed-text
```
Run a DB migration (`vector(1024)` → `vector(768)`) and re-ingest before querying. Ollama runs on `localhost` — a cloud embedding provider is required for Vercel deployments.

---

## Database Schema

```
documents
  id uuid PK
  sport text                  -- "nba" | "nfl" | "mlb" | "fifa"
  season text                 -- "2024-25"
  file_path text              -- Supabase Storage path
  source_url text             -- original league CDN URL (metadata only)
  created_at timestamptz

chunks
  id uuid PK
  document_id uuid → documents.id
  sport text                  -- denormalised for fast vector search filtering
  text text
  embedding vector(1536)      -- HNSW index, cosine distance
  page_number int
  chunk_index int
  created_at timestamptz

queries
  id uuid PK
  user_id uuid → auth.users.id
  sport text
  question text
  answer text
  latency_ms int
  model_id text → models.id
  provider text
  input_tokens int
  output_tokens int
  total_tokens int
  input_cost numeric
  output_cost numeric
  total_cost numeric
  retrieved_chunks jsonb       -- citation payload snapshot
  created_at timestamptz

citations
  id uuid PK
  query_id uuid → queries.id
  document_id uuid → documents.id
  chunk_id uuid → chunks.id
  page_number int
  snippet text
  score numeric
  created_at timestamptz

feedback
  id uuid PK
  query_id uuid → queries.id UNIQUE
  rating int                  -- 1 = thumbs up, 2 = thumbs down
  comment text
  created_at timestamptz

models (see Model Registry above)

settings
  key text PK
  value text

ingestion_runs
  id uuid PK
  document_id uuid → documents.id
  status text                 -- "pending" | "running" | "done" | "failed"
  chunk_count int
  error text
  started_at timestamptz
  finished_at timestamptz
```

---

## Auth Model

```
Browser ──cookie──▶ Next.js (proxy.ts + route handlers)
                         │
                         │ getSupabaseServer() — @supabase/ssr
                         │ validates session against Supabase Auth
                         ▼
                    Supabase Auth (JWT verification)
                         │
                         │ user.id
                         ▼
                    Supabase DB (service role, RLS policies)
```

Two Supabase clients:
- **`getSupabaseServer()`** (`lib/supabase/server.ts`) — anon key + cookie adapter. Used by middleware and route handlers to validate the user session.
- **`getSupabaseAdmin()`** (`lib/supabase.ts`) — service role key. Used for all DB reads/writes. Bypasses RLS; called only in server-side code.

RLS policies are defined on tables so that even if the service role were replaced with the anon key, users could only see their own rows.

---

## Supabase Storage

Bucket: `rulebooks` (public)

Path convention: `raw/sport/{SPORT}/{YEAR}/{filename}.pdf`

Example: `raw/sport/NBA/2024/nba-rulebook-2024-25.pdf`

PDFs are downloaded from official league sources and uploaded to storage before ingestion. The ingestion endpoint (`/api/ingest`) downloads from storage, not from external CDN URLs.

---

## Key Files

```
app/
  api/
    chat/route.ts       RAG pipeline endpoint
    ingest/route.ts     PDF ingestion endpoint
    feedback/route.ts   Feedback store endpoint
    models/route.ts         Model registry endpoint (admin)
    models/enabled/route.ts Enabled models for authenticated users
  login/
    page.tsx            Login page (server component)
    LoginForm.tsx       Login form (client component)
    actions.ts          signOut server action
  admin/users/
    page.tsx            User management (server component)
    actions.ts          createUser / deleteUser server actions
    CreateUserForm.tsx  Create account form (client component)
    DeleteUserButton.tsx Delete button (client component)
  chat/page.tsx         Chat UI
  components/           Shared UI components

lib/
  supabase.ts           getSupabaseAdmin() — service role client
  supabase/server.ts    getSupabaseServer() — cookie session client
  supabase/browser.ts   getSupabaseBrowser() — client-side anon client
  rag.ts                retrieveChunks(), toCitationPayload()
  embeddings.ts         embedText()
  generation.ts         generateAnswer()
  chunking.ts           chunkPages()
  pdf.ts                extractPdfPages()
  models.ts             selectModel(), listEnabledModels()
  cost.ts               computeCost()
  admin.ts              isAdminRequest() — x-admin-key check
  errors.ts             errorResponse(), HttpError

proxy.ts                Route protection middleware
supabase/migrations/    All DB migrations (CLI-managed)
```
