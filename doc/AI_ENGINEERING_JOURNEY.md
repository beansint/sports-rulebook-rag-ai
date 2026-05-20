# AI Engineering Journey

A personal reference document based on what was built in this project, the skill levels of AI engineering, and a clear growth path forward.

---

## What Was Built — SportRules AI

A production-grade RAG (Retrieval-Augmented Generation) system. Not a tutorial project — a real AI-powered Q&A product with a full data pipeline, vector database, cost tracking, auth, and a pluggable model registry.

### The Two Paths

**Write path (ingestion — offline):**
```
PDF in Supabase Storage
  → /api/ingest (admin-only)
  → extractPdfPages()       extract text per page from PDF bytes
  → chunkPages()            split into ~900-token windows, 120-token overlap
  → embedTexts()            OpenAI text-embedding-3-small → 1536-dim vectors
  → INSERT into chunks      store text + vector per chunk
  → UPDATE ingestion_runs   audit trail: status, pages, chunks, errors
```

**Read path (query — real-time):**
```
User question
  → embedText(question)     embed the question the same way chunks were embedded
  → retrieveChunks()        pgvector HNSW: top 8 chunks by cosine similarity, sport-filtered
  → buildContext(chunks)    format as "Source N / Page X / Text: ..."
  → generateAnswer()        LLM sees: system prompt + question + context
  → response                answer + citations + token usage + latency
```

### Why Each Step Matters

**Chunking with overlap:** LLMs have finite context windows — a 200-page rulebook can't fit in a single call. Chunks break it into digestible pieces. The 120-token overlap prevents important sentences from being cut off at chunk boundaries.

**Embeddings:** Convert text into ~1536 numbers that encode semantic meaning, not just keywords. "Jump ball procedure" and "tip-off rules" get similar vectors even if they share no words. This is what makes semantic search work.

**HNSW index:** Hierarchical Navigable Small World — a graph-based approximate nearest neighbor algorithm. Instead of comparing the query vector against every chunk, it navigates a graph to find top-k matches in milliseconds.

**Groundedness enforcement:** The system prompt constrains the LLM to reason only over retrieved chunks. If no relevant chunks exist, the abstain path returns immediately without calling the LLM at all. This is what prevents hallucination.

### Database Schema — Observability Built In

| Table | Purpose |
|---|---|
| `documents` | One row per rulebook PDF, sport + season indexed |
| `chunks` | Every text chunk + its 1536-dim embedding |
| `queries` | Full query log: question, answer, model, tokens, cost, latency |
| `citations` | Which specific chunks were retrieved per query — fully traceable |
| `feedback` | Thumbs up/down per query — raw evaluation data |
| `models` | Registry of LLMs with per-model pricing rates |
| `settings` | Global config — `default_model_id` |
| `ingestion_runs` | Audit trail for every ingest job with status and errors |
| `chat_sessions` | Groups queries into conversations |

Storing `input_cost_usd`, `output_cost_usd`, `total_cost_usd` per query row means you can aggregate and know exactly what AI costs per day, per sport, per model — not an afterthought, production thinking.

### Notable Architecture Decisions

- **Pluggable model registry:** `PROVIDER_CONFIG` in `generation.ts` + the `models` table as source of truth. Adding Groq, Mistral, or NVIDIA NIM is one DB row + one config entry.
- **Admin-only model selection:** Non-admins always use the default model regardless of what they send. Admins can override.
- **Session ownership check:** Before mutating a chat session, the API verifies `user_id` matches — no session hijacking possible.
- **RLS at the DB level:** Row Level Security policies mean users can only read their own queries, enforced by Postgres, not just application code.
- **Ingestion idempotency:** `upsert` on `(sport, season, file_path)` + delete-then-reinsert chunks means re-running ingest is safe.

---

## The Levels of Building With AI

These levels stack — each one builds on the previous, not replaces it.

### Level 1 — LLM Consumer
Call an API, get text back, display it. Zero architecture. What most tutorials teach.

### Level 2 — Prompt Engineer
Control model behavior through system prompts, few-shot examples, JSON mode, temperature tuning, context window management. Knowing when the model is lying to you.

### Level 3 — RAG Systems ← Current level
Give the model external knowledge it wasn't trained on. The key insight: don't ask the model to remember things, ask it to reason over retrieved evidence.

**Upper end of Level 3 (what was built):**
- Offline ingestion pipeline with error tracking and audit trail
- HNSW-indexed pgvector (not a JS array you loop through)
- Sport-filtered retrieval
- Groundedness enforcement with abstain path
- Cost ledger per query with per-model pricing
- Pluggable model registry

**Still at Level 3 — not yet done:**
- Retrieval evaluation (measuring quality, not assuming it)
- Reranking (retrieve 20, score again with a stronger model, keep 5)
- Hybrid search (vector + BM25 keyword together — better for exact rule numbers)
- Query decomposition (break compound questions into sub-queries)
- Streaming responses

### Level 4 — Agent Systems
The model decides what to do next, not just what to say. Instead of a fixed `retrieve → answer` pipeline, the model loops: observe → reason → act → observe again.

```
question
  → model decides: "do I need to search? which tool?"
  → tool call (search, calculator, API, database)
  → model sees result, decides next step
  → loop until done
  → final answer
```

Key engineering challenge: agents can fail, loop, or make wrong decisions. The work is constraining them to fail safely, not freely.

**Key patterns:**
- ReAct (Reason + Act) loops
- Tool/function calling (OpenAI, Claude)
- Multi-step task decomposition
- State machines for agent control flow
- Retry + fallback logic
- Human-in-the-loop checkpoints

### Level 5 — Multi-Agent Orchestration
Specialized agents that collaborate, each with its own role and toolset.

```
Orchestrator
├── Researcher agent (searches, retrieves)
├── Analyst agent (reasons over findings)
├── Critic agent (checks for errors/hallucinations)
└── Writer agent (final output)
```

Hard problem: not getting agents to work, but getting them to fail gracefully and visibly when one goes wrong.

### Level 6 — Production AI Systems
Engineering maturity that applies to every level above.

- **Evals:** automated test suites that score model outputs against ground truth
- **Observability:** every LLM call traced — latency, tokens, cost, input, output
- **Guardrails:** input/output validation before the model sees or says anything
- **Semantic caching:** cache by embedding similarity, not exact text match
- **Model routing:** cheap queries to cheaper models, complex ones to expensive models
- **Fallback chains:** if GPT-4 fails, try Claude, then Groq
- **Cost budgets:** per-user, per-tenant spending limits

Most Level 4-5 builders skip Level 6. That's why agents work in demos and break in production.

---

## Other System Architectures to Explore

RAG is one pattern. The full map:

### Fine-tuning
Bake knowledge into model weights through additional training, instead of providing it at query time.

**When fine-tuning beats RAG:**
- The model needs to learn a style or behavior, not just facts
- You need a very specific output format consistently
- Knowledge is stable and rarely changes
- Latency matters (no retrieval step)

**Experiment:** Take the `queries` table data and fine-tune a small model on question/answer pairs from this project. Compare answer quality vs. RAG.

### Text-to-SQL
The model generates SQL to query a structured database, rather than searching over document chunks.

```
"How many fouls did player X commit last season?"
  → LLM generates: SELECT sum(fouls) FROM stats WHERE player = 'X'
  → Execute query
  → Format result into natural language
```

Hard problems: schema injection, query validation, preventing destructive queries, handling ambiguous questions.

**Experiment:** Build a natural language interface over the `queries` table in this project. Let users ask "what was the most expensive query this week?" and have the model write the SQL.

### Multimodal Systems
The model processes images, audio, or video alongside text.

**Practical patterns:**
- Vision RAG: chunk images (diagrams, charts) instead of just text
- Audio transcription → RAG: speech-to-text then embed and retrieve
- Document parsing with vision: use GPT-4V to extract text from PDFs with complex layouts that `pdf-parse` mangles

**Experiment:** NBA rulebooks have court diagrams and foul position illustrations. The current pipeline probably drops or garbles those pages. Add vision-based extraction for image-heavy pages.

### Memory Systems
How to give an LLM persistent memory across conversations without stuffing entire history into context.

**Patterns (from simplest to most complex):**
- Buffer memory: keep last N messages
- Summary memory: compress older history periodically into a summary
- Episodic memory: store past interactions as embeddings, retrieve relevant ones (RAG applied to conversation history)
- Entity memory: extract and persist key entities (user preferences, stated facts) as structured data

**Experiment:** Extend chat sessions to support follow-up questions. "What about in overtime?" should know the conversation is still about fouls.

### Evaluation Frameworks
Not a user-facing product — the engineering infrastructure that makes everything reliable. Without evals, you are guessing. With evals, you know.

```
Golden dataset: 50 question/expected-answer pairs
  → run each through RAG pipeline
  → score: retrieval relevance, answer accuracy, groundedness, latency
  → compare scores across versions
  → block deploys that regress scores
```

**Scoring techniques:**
- LLM-as-judge: use GPT-4 to score GPT-4-mini's answer against expected
- Semantic similarity: embedding distance between expected and actual answer
- Exact match / regex: for factual outputs (page numbers, rule numbers)

### Streaming + Real-time Architecture
Production AI apps stream. Streaming is both a UX pattern (words appear as generated) and an architecture pattern (start rendering before generation completes, cancel mid-stream, pipe tokens to different consumers).

The Vercel AI SDK handles most of the hard parts — swap `generateAnswer()` for a streaming route and update the frontend to consume the stream.

---

## The Actual Growth Path

In order of leverage — each step builds a skill that reuses across every future AI project:

**Step 1: Evals on this project** (2–3 days)
Build a 30-question NBA rulebook golden test set. Automate scoring with LLM-as-judge. This forces precise thinking about what "correct" means — the most important mindset shift in AI engineering.

**Step 2: Streaming responses** (1 day)
Swap the chat route to stream. Wire the frontend with the Vercel AI SDK `useChat`. Used in every AI product going forward.

**Step 3: Build a simple standalone agent** (1–2 weeks)
Not on this project — a clean isolated build with 2–3 tools (web search, calculator, maybe the rulebook retriever). Goal: feel the loop — model decides, tool executes, model sees result, decides again. Use OpenAI function calling or Claude tool use.

**Step 4: Text-to-SQL** (1 week)
Natural language interface over a structured DB. Completely different retrieval architecture than RAG, teaches a new class of problems.

**Step 5: Add evals to the agent** (1 week)
Level 4 meets Level 6. An agent that works once in a demo is table stakes. An agent you can prove works across 50 different inputs is engineering.

---

## The Actual Insight

RAG, agents, fine-tuning, Text-to-SQL are not competing architectures. They are tools. Real AI systems combine them:

- Use **RAG** for knowledge retrieval
- Use an **agent** to decide *when* to retrieve and *what* to do with the result
- Use **fine-tuning** to make the model better at the specific task format
- Use **evals** to prove the whole thing works

The jump from Level 3 to Level 4 — from RAG to agents — is where retrieval becomes dynamic instead of static. Instead of always retrieving, the model decides whether retrieval is even needed, and can call retrieval multiple times if the first result wasn't sufficient.

That is the jump from "AI feature developer" to "AI systems engineer."

---

## Gaps Still Open in This Project

For reference — what's been designed but not yet implemented:

- [ ] Retrieval evaluation harness (golden dataset + automated scoring)
- [ ] Streaming responses (Vercel AI SDK)
- [ ] Reranking step (retrieve 20, keep top 5 after re-scoring)
- [ ] Hybrid search (pgvector + full-text BM25 combined)
- [ ] Multi-turn memory (follow-up questions within a session)
- [ ] Scraping pipeline (automated PDF acquisition from NBA/NFL/MLB/FIFA sources)
- [ ] PDF viewer (show exact rulebook page for citations)
- [ ] Observability (Helicone or LangSmith integration)
