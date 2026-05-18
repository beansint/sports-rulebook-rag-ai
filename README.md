# SportRules AI

A RAG-powered sports rulebook Q&A app. Ask natural-language questions about official league rulebooks and get grounded answers with exact rule citations and page references.

v1 focuses on the NBA rulebook with ingestion support for NBA, NFL, MLB, and FIFA/IFAB.

---

## Features

- **Natural-language Q&A** grounded in official rulebook PDFs
- **Cited answers** — every response includes the exact rule text, page number, and similarity score
- **Multi-sport ingestion** — NBA, NFL, MLB, FIFA/IFAB PDFs chunked, embedded, and stored in pgvector
- **Pluggable model registry** — swap LLM providers (OpenAI, Cerebras, Groq, NVIDIA NIM, Mistral) without code changes
- **Per-query cost tracking** — token counts and dollar cost logged against each query
- **Feedback loop** — thumbs up/down + comment stored per query for eval
- **Cookie-based auth** — personal/private; no public registration; owner manages accounts via admin UI
- **Admin panel** — create and delete test accounts at `/admin/users`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API | Next.js 16.2.6 (App Router) |
| Database | Supabase Postgres (pgvector for embeddings) |
| File Storage | Supabase Storage |
| Auth | Supabase Auth + `@supabase/ssr` (cookie sessions) |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | Pluggable — default `gpt-4.1-mini`; free tier: Cerebras Llama 3.3 70B |
| Deployment | Vercel (Hobby) |
| Language | TypeScript 6, React 19 |
| Styling | Tailwind CSS v4 |

---

## Architecture Overview

```
User question
     │
     ▼
embed question (text-embedding-3-small)
     │
     ▼
pgvector similarity search → top-k chunks (sport-filtered)
     │
     ▼
LLM generation with context-constrained prompt
     │
     ▼
answer + citations (pageNumber, snippet, score) + token usage
```

Full details: [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md)

---

## Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project with migrations applied (`supabase db push --linked`)
- OpenAI API key (for embeddings); any OpenAI-compatible provider for chat

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/beansint/sports-rulebook-rag-ai.git
cd sports-rulebook-rag-ai
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Auth
ADMIN_EMAIL=you@example.com          # owner account; controls /admin/* access
ADMIN_API_KEY=<random secret>        # header key for programmatic admin routes

# LLM / Embeddings
OPENAI_API_KEY=<key>                 # used for embeddings (text-embedding-3-small)
# CEREBRAS_API_KEY=<key>             # optional free LLM provider
```

Optional overrides:

```env
EMBEDDING_MODEL=text-embedding-3-small
DEFAULT_CHAT_MODEL=gpt-4.1-mini
```

### 3. Apply database migrations

```bash
supabase link --project-ref <project-id>
supabase db push --linked
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Supabase Auth Setup

This app uses email/password auth with no public signup. Before running locally:

1. **Supabase Dashboard → Authentication → Settings** → toggle **Disable signups** ON
2. **Authentication → Settings** → set **Confirm email** to OFF
3. **Authentication → URL Configuration** → add `http://localhost:3000` to Redirect URLs
4. Create your owner account via the admin users page (`/admin/users`) once the app is running, or via the Supabase dashboard

---

## API Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/chat` | Cookie session | Ask a question; returns answer + citations |
| `POST /api/feedback` | Cookie session | Submit thumbs up/down on a query |
| `POST /api/ingest` | `x-admin-key` header | Ingest a PDF from Supabase Storage |
| `GET /api/models` | `x-admin-key` header | List model registry entries |
| `POST /api/models` | `x-admin-key` header | Create/update a model registry entry |

### Chat request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: <session cookie>" \
  -d '{"question": "Can a player call timeout while in the air?", "sport": "nba"}'
```

### Ingest a PDF

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "fileUrl": "https://<project>.supabase.co/storage/v1/object/public/rulebooks/raw/sport/NBA/2024/nba-rulebook-2024-25.pdf",
    "sport": "nba",
    "season": "2024-25"
  }'
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `documents` | One row per rulebook PDF (sport, season, storage path) |
| `chunks` | Text chunks with pgvector embedding, page number, chunk index |
| `queries` | Full query log — question, answer, model, token counts, cost |
| `citations` | Query → chunk links with similarity score |
| `feedback` | Thumbs up/down + optional comment per query |
| `models` | Model registry — provider, pricing rates, enabled flag |
| `settings` | Global config (`default_model_id`) |
| `ingestion_runs` | Ingestion job log per document |

---

## CI/CD

GitHub Actions run on every PR and push to `dev`/`main`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | PRs + pushes to `dev`/`main` | Typecheck + build |
| `supabase-migrations.yml` | PRs: dry-run; `main`: apply | Validate and deploy migrations |
| `vercel-preview.yml` | PR opened/updated | Deploy preview, comment URL on PR |
| `vercel-production.yml` | Push to `main` | Deploy production |

### Required GitHub Secrets

**Supabase:**
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

**Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**App secrets (production env):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_KEY`
- `ADMIN_EMAIL`
- `OPENAI_API_KEY`

---

## Development Scripts

```bash
pnpm dev          # start dev server (Turbopack)
pnpm build        # production build
pnpm start        # serve production build
pnpm typecheck    # TypeScript check (no emit)
```

---

## Project Docs

| Document | Description |
|---|---|
| [doc/PRD.md](doc/PRD.md) | Product requirements and feature spec |
| [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) | System architecture, RAG pipeline, data flow |
| [doc/IMPLEMENTATION.md](doc/IMPLEMENTATION.md) | Implementation notes and decisions |
| [doc/scraping-pipeline.md](doc/scraping-pipeline.md) | PDF acquisition pipeline spec |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Git conventions, branching, migration workflow |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for git conventions, branch naming, atomic commit rules, and the Supabase migration workflow.
