# SportRules AI – Sports Rulebook RAG Assistant (v1)

## 1. Product Overview

**Name (working):** SportRules AI – NBA Rulebook Assistant (v1)  
**Type:** Web app (responsive), RAG-based rulebook Q&A  
**Goal:** Let users ask natural-language questions about a sport’s official rulebook and instantly see (1) a clear answer and (2) the exact rule text and page in a side-by-side document viewer.

This is a domain RAG app focused on dense, authoritative reference content, similar to legal/policy assistants but scoped to sports regulations.[web:44][web:47]

---

## 2. Problem & Objectives

### 2.1 Problem

- Official sports rulebooks are long PDFs that are hard to search manually.
- Users (fans, coaches, refs, content creators) want to quickly answer “Is X allowed?” and “What’s the penalty for Y?” with primary-source backing, not just “AI says so”.

### 2.2 Objectives (v1)

1. Provide fast, grounded answers to NBA rule questions with directly linked rule text.
2. Allow users to inspect and verify the rule in context via a PDF viewer and text highlight.
3. Collect enough interaction and evaluation data to prove retrieval + answer quality meet defined metrics, aligning with current RAG evaluation guidance around relevance and groundedness.[web:29][web:88]
4. Support **multiple LLM providers/models** with:
   - switchable default model,
   - ability to enable/disable specific models,
   - and per-query tracking of token usage and estimated cost.[web:108][web:115][web:123]

---

## 3. Users & Use Cases

### 3.1 Primary Users

- You / technical evaluators: validate AI engineering skills and RAG quality.
- Power users: coaches, serious fans, analysts who know rules exist but don’t want to hunt.

### 3.2 Key User Stories

- As a user, I want to ask “Is goaltending allowed after the ball hits the backboard?” and get:
  - a clear answer,
  - the relevant rule text,
  - and highlighted pages in the official NBA rulebook.
- As a user, I want the app to admit uncertainty or say “not covered” instead of guessing when the rulebook is silent.
- As an admin, I want to upload a rulebook (PDF) and have it ingested for future queries.
- As an admin, I want to **choose which LLM model is used by default**, and **disable models** I no longer want users (or myself) to call.
- As an admin, I want to **see how many tokens and how much cost** each model has consumed so I can keep infra spend under control.

---

## 4. Scope (v1)

### 4.1 In Scope

- **UI focus:** multi-sport rulebook assistant — NBA, NFL, MLB, and FIFA are all ingested, embedded, and selectable in the chat UI.
- **Ingestion pipeline:** supports all four sports (NBA, NFL, MLB, FIFA) as PDF rulebooks; each is ingested and exposed in the UI with its answers labelled by source rulebook + edition.
- **Corpus type:** PDF rulebooks (plus internal chunk metadata).
- Web app (desktop + mobile responsive) built with **Next.js**.
- RAG pipeline:
  - PDF ingestion → text extraction → chunking → embeddings → pgvector.
  - Retrieval on user query; top‑k chunk selection.
  - Answer generation constrained to retrieved context with “I don’t know” fallback.[web:29][web:80]
- UI:
  - Chat-style interface (question input + streamed answer).
  - Right-side document viewer that jumps to cited pages and highlights relevant text.
  - List of citations with page/section metadata.
- Admin:
  - Simple upload and reindex page for rulebook.
  - **Model management UI**:
    - View list of configured models.
    - Enable/disable models.
    - Set default model.
- Telemetry:
  - Logging of queries, responses, latency, and feedback.
  - **Per-query token usage + estimated cost**, aggregated in an admin dashboard.[web:108][web:115][web:123]
- Data acquisition:
  - Rulebook PDFs may be obtained manually or via an automated scraping pipeline (Comet).
  - A separate **Scraping & Source Acquisition Spec** (`SCRAPING_PIPELINE.md`) defines how NBA, NFL, MLB, and FIFA rulebooks are fetched and normalized.

### 4.2 Out of Scope (v1)

- Multi-sport user-facing UI (beyond NBA; other sports are ingested but hidden).
- Mobile native apps (Flutter / React Native / Kotlin).
- Image/video attachments.
- Complex user auth and multi-tenant organization structure.
- Fine-tuning models.
- Monetization, payments, and user billing.
- Online examples/case studies integration (Phase 2).

---

## 5. System Overview

### 5.1 Architecture (v1)

- **Frontend:** Next.js (App Router) on Vercel – chat UI, PDF viewer, admin pages.
- **Backend (API layer):** Next.js Route Handlers:
  - `POST /api/ingest` – ingest PDF from Supabase storage, create chunks, generate embeddings.
  - `POST /api/chat` – retrieve, generate answer, return citations.
  - `GET/POST /api/models` – list and update model configurations (enable/disable, default).
- **Models & providers:**
  - Pluggable **model registry** supporting multiple providers (e.g., OpenAI, NVIDIA NIM, Groq, Mistral) with per-model pricing metadata.[web:108][web:115][web:123]
  - Default model configured via environment variable and/or DB setting; admin can change it.
  - Models can be **disabled** at config level so the UI and API ignore them.
- **Data & infra:**
  - **Supabase:**
    - Postgres tables: `documents`, `chunks`, `queries`, `citations`, `feedback`, `models`, `settings`.
    - Storage: original PDF file(s).
    - pgvector for dense retrieval.
  - **Deployment:**
    - Frontend + serverless API on **Vercel Hobby**.
    - Database, vector search, storage on **Supabase Free**.[web:63][web:64][web:71]

---

## 6. Functional Requirements

### 6.1 Chat & Answer Generation

- User can input a question in the chat.
- System will:
  - Perform vector retrieval over chunks in Supabase pgvector.
  - Build a prompt that includes the top‑k context chunks.
  - Choose an LLM model:
    - Default: global default model from `settings.default_model_id` (or env).
    - Optional: per-request `modelId` when allowed (admin/testing only).
    - Only models where `models.enabled = true` are eligible.
  - Call the chosen LLM to generate an answer only based on the retrieved context; otherwise respond with “I don’t know / not covered by the rulebook”.[web:29][web:80]
- Response payload includes:
  - `answer`: markdown/plain text.
  - `citations`: list of `{document_id, page_number, chunk_id, snippet, score}`.
  - `latencyMs`.
  - `model`: `{ modelId, provider }`.
  - `usage`: `{ inputTokens, outputTokens, totalTokens, estimatedCostUsd }`.

### 6.2 Document Viewer & Highlighting

- Right-side viewer displays the NBA rulebook PDF.
- Clicking a citation:
  - Scrolls/jumps to the cited `page_number`.
  - Highlights text matching the citation snippet (approximate substring match) within that page.

### 6.3 Admin Ingestion

- Auth for ingestion is restricted to admin users.
- Admin page allows:
  - Uploading a new PDF (or selecting from PDFs already uploaded by a pipeline).
  - Triggering ingestion: parse PDF, extract pages, generate chunks, compute embeddings, store in DB/storage.
  - Viewing ingestion summary (pages processed, chunks created).
- All ingestion runs use PDFs stored in **Supabase storage** (`documents.file_path`) as the source of truth. External league URLs (`source_url`) are stored as metadata only and are not fetched at query time.

### 6.4 Logging, Feedback & Cost Tracking

- For each query, log:
  - `id`, `user_id` (if available), `sport`, `question`, `answer`, `timestamp`.
  - `retrieved_chunks` (ids, scores, pages).
  - `latency_ms`.
  - **Model metadata**:
    - `model_id` (e.g., `gpt-4.1-mini`, `nvidia-llama-3-70b`),
    - `provider` (e.g., `openai`, `nvidia`).
  - **Usage & cost**:
    - `input_tokens`, `output_tokens`, `total_tokens`.
    - `input_cost_usd`, `output_cost_usd`, `total_cost_usd`, computed from configured per-model pricing.[web:108][web:115][web:123]
- Feedback:
  - Thumbs up / down per answer.
  - Optional free-text comment.
  - Stored in `feedback` table.
- Admin dashboard:
  - Aggregate usage by day and model:
    - number of queries,
    - sum of tokens,
    - total estimated cost,
    - average cost per query.
  - Ability to see which model is driving most of the spend.

### 6.5 Model Management

- Admin interface to manage models:
  - List all models from `models` table:
    - `id`, `provider`, `display_name`, `enabled`, `input_rate_per_m`, `output_rate_per_m`, `context_window`.
  - Toggle `enabled` flag on/off for each model.
  - Set one model as `default` (stored in `settings.default_model_id`).
- Non-admin users:
  - Cannot see raw model list.
  - The chat UI uses the current default model silently (no model selector) in v1.

---

## 7. Non-functional Requirements

- **Performance:** p95 latency ≤ 6–7 seconds for typical queries on the chosen infra.[web:33][web:80]
- **Reliability:** no crashes on malformed input; ingestion errors logged with clear messages.
- **Cost:** runs on Vercel Hobby + Supabase Free for v1; cost dashboard shows estimated LLM spend by model.[web:63][web:64][web:71]
- **Security:** rulebook content is public; ingestion/admin routes and model management require admin auth.
- **UX:** fully usable on desktop and mobile via responsive layout; no native app required.

---

## 8. Data Model (Initial)

### 8.1 `documents`

- `id` (uuid, pk)
- `sport` (text, e.g., `"nba"`)
- `season` (text, e.g., `"2025-26"`)
- `title` (text)
- `source_url` (text, optional; original league URL)
- `file_path` (text, Supabase storage path)
- `pages` (int, optional)
- `created_at` (timestamp)

### 8.2 `chunks`

- `id` (uuid, pk)
- `document_id` (fk → `documents`)
- `page_number` (int)
- `chunk_index` (int) – position in document.
- `text` (text)
- `embedding` (vector) – pgvector column.
- `created_at` (timestamp)

### 8.3 `queries`

- `id` (uuid, pk)
- `user_id` (uuid, nullable, fk to auth.users)
- `sport` (text)
- `question` (text)
- `answer` (text)
- `latency_ms` (int)
- `model_id` (text) – fk to `models.id`
- `provider` (text) – e.g., `"openai"`, `"nvidia"`
- `input_tokens` (int)
- `output_tokens` (int)
- `total_tokens` (int)
- `input_cost_usd` (numeric)
- `output_cost_usd` (numeric)
- `total_cost_usd` (numeric)
- `created_at` (timestamp)

### 8.4 `citations`

- `id` (uuid, pk)
- `query_id` (fk → `queries`)
- `chunk_id` (fk → `chunks`)
- `score` (float)
- `created_at` (timestamp)

### 8.5 `feedback`

- `id` (uuid, pk)
- `query_id` (fk → `queries`)
- `rating` (int: 1=down, 2=up)
- `comment` (text, nullable)
- `created_at` (timestamp)

### 8.6 `models`

Represents the model registry; one row per model you might use.

- `id` (text, pk) – e.g., `"gpt-4.1-mini"`, `"nvidia-llama-3-70b"`
- `provider` (text) – `"openai"`, `"nvidia"`, `"groq"`, `"mistral"`
- `display_name` (text)
- `enabled` (boolean)
- `input_rate_per_m` (numeric) – USD per 1M input tokens
- `output_rate_per_m` (numeric) – USD per 1M output tokens
- `context_window` (int)
- `created_at` (timestamp)

### 8.7 `settings`

Global configuration (one row or a small key/value table).

- `id` (pk, e.g., `"global"`)
- `default_model_id` (text, fk → `models.id`)
- (Optional) other flags later (e.g., `eval_mode_enabled`)

---

## 9. API Contracts (v1)

### 9.1 `POST /api/ingest`

**Purpose:** Ingest a PDF rulebook from Supabase storage, create chunks, and store embeddings.

**Request**

```json
{
  "sport": "nba",
  "season": "2025-26",
  "title": "Official 2025-26 NBA Playing Rules",
  "fileUrl": "https://<supabase-storage>/rulebooks/nba/2025-26/nba-official-playing-rules-2025-26.pdf"
}
```

- `fileUrl` must point to a PDF already uploaded to Supabase storage (or equivalent internal blob storage), not directly to the external league CDN URL.

**Response**

```json
{
  "documentId": "uuid",
  "pagesProcessed": 76,
  "chunksCreated": 3200
}
```

### 9.2 `POST /api/chat`

**Request**

```json
{
  "question": "Is it a violation to hang on the rim after a dunk?",
  "sport": "nba",
  "modelId": "gpt-4.1-mini"
}
```

- `modelId` is optional:
  - If absent: use `settings.default_model_id`.
  - If present: only honored for admins in v1; otherwise ignored or validated against allowed list.

**Response**

```json
{
  "answer": "Yes, under NBA rules, a player may not hang on the rim except to avoid injury. The referee may assess a technical foul ...",
  "citations": [
    {
      "documentId": "uuid",
      "pageNumber": 45,
      "chunkId": "uuid",
      "snippet": "A player shall not hang on the basket ring, or cause the backboard to vibrate ...",
      "score": 0.92
    }
  ],
  "model": {
    "modelId": "gpt-4.1-mini",
    "provider": "openai"
  },
  "usage": {
    "inputTokens": 820,
    "outputTokens": 120,
    "totalTokens": 940,
    "estimatedCostUsd": 0.0008
  },
  "latencyMs": 3820
}
```

### 9.3 `GET /api/models` (admin)

Returns list of model configurations and which are enabled.

### 9.4 `POST /api/models` (admin)

Update model configs (e.g., enable/disable, rates, default).

---

## 10. RAG Pipeline Design

Based on current RAG evaluation and best practices:[web:29][web:75][web:80][web:88]

1. **Ingestion**
   - Extract per-page text from PDF in Supabase storage.
   - Normalize whitespace; keep page boundaries.
   - Chunking:
     - e.g., 512–1024 token windows with overlap.
     - Retain `page_number` and `chunk_index` in metadata.

2. **Embedding**
   - Generate embeddings for each chunk.
   - Store in `chunks.embedding` (pgvector).

3. **Retrieval**
   - For each query:
     - Embed query.
     - Vector search over `chunks` with filter `sport = 'nba'` (or other sport when enabled).
     - Select top‑k chunks (e.g., 5–8) by similarity.

4. **Generation**
   - Prompt template:
     - System: “You are an assistant answering questions strictly based on the official rulebook text. Use only the provided context. If the answer is not in the context, say you don’t know or that the rule is not covered.”
     - Insert context chunks with page info.
     - Append user question.
   - Use selected model (from model registry) to generate answer and token usage metadata.

5. **Post-processing**
   - Extract citations from chosen chunks.
   - Store query, answer, citations, latency, model metadata, token usage, and cost in DB.

6. **Evaluation**
   - Use small eval set and LLM-as-judge/manual labels to score:
     - **Retrieval relevance / context precision** – how relevant are the retrieved chunks?[web:29][web:88][web:91]
     - **Faithfulness / groundedness** – are answer claims supported by retrieved text?[web:36][web:87][web:93]
     - **Answer relevance** – does the answer address the query?[web:36][web:93]
     - **“I don’t know” correctness** – does the model abstain appropriately when context is missing?
   - Optionally compare models (e.g., OpenAI vs NVIDIA) by running eval set against multiple enabled models.

---

## 11. Evaluation & Success Metrics

Following modern RAG evaluation recommendations:[web:29][web:36][web:88][web:93]

- **Retrieval relevance (context precision):**
  - Target ≥ **0.85** average relevance score on eval set.
- **Answer groundedness / faithfulness:**
  - Target ≥ **0.90** – answer claims are supported by retrieved text.
- **Answer relevance:**
  - Target ≥ **0.85** – answers actually resolve the question.
- **“I don’t know” correctness:**
  - Target ≥ **0.90** on intentionally unanswerable queries.
- **Citation accuracy:**
  - ≥ **95%** of cited pages/snippets correspond to the correct rule passages.
- **Latency p95:**
  - ≤ **6–7 seconds** from question to answer on v1 infra.
- **Error rate:**
  - ≤ **5%** failed calls (API errors, timeouts, etc.).
- **Cost benchmarks:**
  - Track **average cost per successful query** and **daily total cost** per model; keep within a manually set budget (e.g., ≤ a few USD/month at PoC scale).[web:108][web:121]

**Stop condition for v1:** Once these thresholds are met on a ~30–50-question eval set, cost is controlled, and basic UX is stable and deployed.

---

## 12. Timeline (v1)

Loosely aligned with SDLC phases: planning, design, implementation, testing, deployment, maintenance.[web:73][web:76][web:81]

- **Week 1:**
  - Finalize requirements and architecture.
  - Implement DB schema (including `models`, `settings`, updated `documents`) and ingestion skeleton.
  - Wire Supabase storage integration.
- **Week 2:**
  - Complete ingestion + embeddings for NBA rulebook.
  - Implement retrieval + `/api/chat` with model registry integration.
- **Week 3:**
  - Build chat UI + PDF viewer + citation linking.
  - Add model management UI and cost logging.
  - Responsive layout polish.
- **Week 4:**
  - Build eval set + evaluation script.
  - Manual testing, tuning, deployment to Vercel + Supabase.
  - Minimal monitoring and cost dashboard.