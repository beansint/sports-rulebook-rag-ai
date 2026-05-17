# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SportRules AI** – A RAG-based sports rulebook Q&A web app. Users ask natural-language questions about official sports rulebooks and receive grounded answers with citations and a PDF viewer showing the exact rule text.

v1 is scoped to the NBA rulebook as the user-facing sport, with ingestion support for NBA, NFL, MLB, and FIFA/IFAB.

## Stack

- **Frontend + API:** Next.js (App Router) deployed on Vercel Hobby
- **Database + Storage + Vector Search:** Supabase Free (Postgres + pgvector + Storage)
- **LLM:** Pluggable model registry supporting multiple providers (OpenAI, NVIDIA NIM, Groq, Mistral)

## Architecture

### API Routes (Next.js Route Handlers)
- `POST /api/ingest` – pull PDF from Supabase storage, chunk, embed, store
- `POST /api/chat` – embed query → pgvector retrieval → LLM generation → return answer + citations + token usage
- `GET/POST /api/models` – admin-only model registry management

### RAG Pipeline
1. PDF stored in Supabase Storage → text extraction → 512–1024 token chunks with overlap
2. Embeddings stored in `chunks.embedding` (pgvector column)
3. At query time: embed question → vector search with `sport` filter → top-k chunks → LLM with context-constrained prompt
4. Response always includes citations (documentId, pageNumber, chunkId, snippet, score), model metadata, and token usage/cost

### Model Registry
The `models` table is the source of truth for available LLMs. Each model has `enabled` (boolean) and pricing rates (`input_rate_per_m`, `output_rate_per_m`). The active default is stored in `settings.default_model_id`. Only `enabled = true` models are used.

### Key DB Tables
- `documents` – one row per rulebook PDF (sport, season, file_path in Supabase Storage, source_url as metadata only)
- `chunks` – text chunks with pgvector embedding, page_number, chunk_index
- `queries` – full query log including model_id, token counts, cost fields
- `citations` – links query → chunks with similarity score
- `feedback` – thumbs up/down + optional comment per query
- `models` – model registry (id is the model name string, e.g. `"gpt-4.1-mini"`)
- `settings` – global config, primarily `default_model_id`

### Scraping Pipeline
Rulebook PDFs are acquired via a Comet-based scraping pipeline. See `doc/scraping-pipeline.md` for the full spec. PDFs follow the path structure `raw/sport/{SPORT}/{YEAR}/` and are accompanied by a manifest JSON. After scraping, PDFs are uploaded to Supabase Storage and ingested via `/api/ingest`.

The four target sources:
- NBA: `official.nba.com/rulebook` → PDFs on `cdn.nba.com` or `ak-static.cms.nba.com`
- NFL: `operations.nfl.com/the-rules/nfl-rulebook` → PDFs on `operations.nfl.com/media/`
- MLB: `mlb.com/glossary/rules` → PDFs on `img.mlbstatic.com` or `mktg.mlbstatic.com`
- FIFA/IFAB: `theifab.com` → PDFs on `downloads.theifab.com`

## Key Constraints

- `fileUrl` in `/api/ingest` must point to Supabase Storage, never directly to external league CDN URLs
- Admin routes (`/api/ingest`, `/api/models`) require admin auth; chat is public
- Per-query cost is computed from `models.input_rate_per_m` / `output_rate_per_m` and stored on the `queries` row
- The `modelId` param in `/api/chat` is only honored for admins in v1; non-admins always use the default model
- Answer generation must be context-constrained: if the answer isn't in retrieved chunks, respond with "I don't know / not covered by the rulebook"

## Git & Branching Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Commit message format
```
<type>(<scope>): <short description>

[optional body]
[optional footer — Closes #N]
```

**Types:** `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `ci` · `perf` · `style`

**Scopes (examples):** `api` · `rag` · `ui` · `db` · `auth` · `ingest` · `models` · `ci`

**Examples:**
```
feat(rag): add sport filter to vector search
fix(api): return 400 when fileUrl is not Supabase Storage
chore(db): add index on chunks.document_id
ci: cache pnpm store in validation workflow
```

### Branch naming
```
<type>/<short-slug>
```
Examples: `feat/pdf-viewer`, `fix/chat-timeout`, `chore/update-deps`, `docs/api-reference`

- Always branch off `dev`
- One branch per feature/fix — no long-lived topic branches
- Delete branch after PR is merged

### PR and issue flow
1. Create a GitHub issue first (`gh issue create --assignee @me`)
2. Branch off `dev`: `git checkout -b <type>/<slug>`
3. Commit using Conventional Commits
4. PR targets `dev` with `Closes #N` in the body
5. `main` receives merges from `dev` only for releases — never commit directly to `main` or `dev`

## Supabase Migration Workflow

Always use the CLI. Never apply DDL directly via the dashboard SQL editor or MCP `execute_sql` — it creates migration history mismatches that break CI.

```bash
# 1. Create the migration file
supabase migration new <descriptive_name>

# 2. Write SQL in the generated file under supabase/migrations/

# 3. Validate against remote (free — dry run only)
supabase db push --linked --dry-run

# 4. Commit and open PR into dev
git add supabase/migrations/
git commit -m "chore(db): <description>"
# CI deploys to remote automatically on merge to main
```

**Why:** `supabase db push --dry-run` is free and runs on every PR. The actual push runs once on merge to `main`, minimising Supabase compute usage on the free/hobby plan.

## Contribution Hygiene

- Do not include generator, tool, or model attribution banners in commit messages, PR titles/descriptions, code comments, or docs unless explicitly requested.
- Avoid boilerplate generator footers in committed files.

## Success Metrics (v1)
- Retrieval relevance ≥ 0.85, groundedness ≥ 0.90, answer relevance ≥ 0.85
- "I don't know" correctness ≥ 0.90 on unanswerable queries
- Citation accuracy ≥ 95%, p95 latency ≤ 6–7 seconds, error rate ≤ 5%
