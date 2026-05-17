# SportRules AI

RAG-based sports rulebook Q&A app built with Next.js + Supabase + pgvector.

v1 user-facing scope is NBA rules, with ingestion support for NBA, NFL, MLB, and FIFA/IFAB.

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres, pgvector, Storage)
- OpenAI SDK (model calls via model registry)
- TypeScript

## Prerequisites

- Node.js 20+
- pnpm 10+
- A Supabase project with migrations applied
- OpenAI API key

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ADMIN_API_KEY`
- `EMBEDDING_MODEL` (default: `text-embedding-3-small`)
- `DEFAULT_CHAT_MODEL` (default: `gpt-4.1-mini`)

## Run

Development:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Start production build:

```bash
pnpm start
```

Type-check:

```bash
pnpm typecheck
```

## VS Code Debugging

This repo includes [`.vscode/launch.json`](/Users/vincentp/Documents/Projects/sports-rulebook-rag-ai/.vscode/launch.json) with three configs:

- `Next.js: debug server` (Node server-side breakpoints)
- `Next.js: debug full stack` (server + auto-open browser debugger)
- `Next.js: attach to server` (attach to inspector on `9229`)

Use the Run and Debug panel in VS Code and select one of those targets.

## API Endpoints

- `POST /api/chat` (public)
- `POST /api/ingest` (admin only)
- `GET /api/models` (admin only)
- `POST /api/models` (admin only)
- `POST /api/feedback` (public)

### Admin Auth

Set the `x-admin-key` header to `ADMIN_API_KEY` for admin routes.

## Ingestion Notes

- `fileUrl` for `/api/ingest` must reference a file in Supabase Storage.
- External CDN PDF URLs should be stored as metadata (`source_url`) and not used directly for ingestion.

## Data Model (High-level)

- `documents`: one row per rulebook PDF
- `chunks`: extracted text chunks + embeddings
- `queries`: query logs + token/cost usage
- `citations`: query-to-chunk links + similarity
- `feedback`: user feedback per query
- `models`: model registry
- `settings`: global settings (`default_model_id`)

## Project Docs

- Product requirements: [doc/PRD.md](/Users/vincentp/Documents/Projects/sports-rulebook-rag-ai/doc/PRD.md)
- Implementation notes: [doc/IMPLEMENTATION.md](/Users/vincentp/Documents/Projects/sports-rulebook-rag-ai/doc/IMPLEMENTATION.md)
- Scraping pipeline: [doc/scraping-pipeline.md](/Users/vincentp/Documents/Projects/sports-rulebook-rag-ai/doc/scraping-pipeline.md)

## CI/CD

This repository includes GitHub Actions workflows for CI, Supabase migrations, and Vercel deployments:

- `.github/workflows/ci.yml`: runs `typecheck` and `build` on PRs and pushes to `dev`/`main`.
- `.github/workflows/supabase-migrations.yml`: validates migration files on PRs and deploys migrations on `main`.
- `.github/workflows/vercel-preview.yml`: deploys PR previews to Vercel and comments the preview URL.
- `.github/workflows/vercel-production.yml`: deploys production on `main` pushes.

### Required GitHub secrets

Supabase:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Vercel:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID` (create/import this project in Vercel first)

### One-time Vercel project bootstrap

1. Import `beansint/sports-rulebook-rag-ai` into Vercel (or create a Vercel project with this repo connected).
2. Set project environment variables in Vercel (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ADMIN_API_KEY`, optional overrides).
3. Copy the project ID into GitHub secret `VERCEL_PROJECT_ID`.
