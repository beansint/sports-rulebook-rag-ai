# Contributing

## Git Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Commit format

```
<type>(<scope>): <short description> #N

[body — what changed and why]

[Closes #N]
```

- Reference the issue number `#N` in both the subject line and the `Closes` footer
- Body is required when the change isn't self-evident from the subject
- `Closes #N` auto-closes the issue on PR merge

**Types:** `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `ci` · `perf` · `style`

**Scopes:** `api` · `rag` · `ui` · `db` · `auth` · `ingest` · `models` · `ci`

**Examples:**

```
feat(rag): add sport filter to vector search #14

Filters pgvector similarity search by the `sport` column so queries
never surface chunks from a different rulebook.

Closes #14
```

```
fix(api): return 400 when fileUrl is not Supabase Storage #17
chore(db): add index on chunks.document_id #19
```

---

## Atomic Commits

Never `git add .` and commit everything at once. Stage files in logical groups — one commit per distinct concern.

| Group | Examples |
|---|---|
| Schema / migrations | `supabase/migrations/*.sql` |
| API route | `app/api/<route>/route.ts` + its lib helper |
| Lib module | `lib/chunking.ts`, `lib/embeddings.ts` (one per module) |
| Types | `types/*.ts` |
| Config / tooling | `next.config.ts`, `tsconfig.json` |
| CI | `.github/workflows/*.yml` |
| Docs | `CLAUDE.md`, `doc/*.md`, `README.md` |

**Example — feature with a new API route:**

```bash
git add supabase/migrations/20260517_add_feedback_index.sql
git commit -m "chore(db): add index on feedback.query_id #14"

git add lib/cost.ts
git commit -m "feat(api): compute per-query cost from model rates #14"

git add app/api/feedback/route.ts
git commit -m "feat(api): add POST /api/feedback endpoint #14

Stores thumbs up/down + optional comment against a query_id.

Closes #14"
```

---

## Branch Naming

```
<type>/<short-slug>
```

Examples: `feat/pdf-viewer`, `fix/chat-timeout`, `chore/update-deps`

- Always branch off `dev`
- One branch per feature/fix
- Delete branch after PR is merged
- Never commit directly to `main` or `dev`

---

## PR and Issue Flow

1. Create a GitHub issue first: `gh issue create --assignee @me`
2. Branch off `dev`: `git checkout -b <type>/<slug>`
3. Commit in atomic groups, each referencing `#N`
4. Open PR targeting `dev` with `Closes #N` in the body
5. `main` receives merges from `dev` only — never commit directly to `main`

---

## Supabase Migration Workflow

Always use the CLI. Never apply DDL directly via the Supabase dashboard SQL editor — it creates migration history mismatches that break CI.

```bash
# 1. Create the migration file
supabase migration new <descriptive_name>

# 2. Write SQL in the generated file (supabase/migrations/)

# 3. Validate against remote (free — dry-run only)
supabase db push --linked --dry-run

# 4. Commit and open PR into dev
git add supabase/migrations/
git commit -m "chore(db): <description> #N"
```

The actual push to remote runs once on merge to `main` via CI.

---

## Running Locally

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm dev
```

See [README.md](README.md) for full setup instructions.
