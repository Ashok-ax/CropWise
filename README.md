# CropWise — monorepo

This repo has two parts:

```
.
├── frontend/    Next.js app (deploy to Netlify)
└── supabase/    Database migrations + the ai-assistant Edge Function
    ├── config.toml
    ├── migrations/
    └── functions/ai-assistant/
```

The original three uploaded zips (`frontend`, `database`, `backend`) have been
merged into this layout because the Supabase CLI expects migrations and
functions to live under a single `supabase/` folder (with a `config.toml`
at its root) — that folder didn't exist before, so `supabase link` /
`supabase db push` had nothing valid to attach to.

## What was fixed

1. **Duplicate migrations that silently double-inserted seed data.**
   `database.zip` contained two copies of the same six migrations, timestamped
   ~35 minutes apart (`095xxx_...` and `110xxx_...`), plus a third variant of
   the trigger. All six duplicates have been removed — only the original
   `095xxx` set + the `103829` trigger patch + the `20260724` marketplace
   migration are kept (8 files instead of 14).

   The database README claimed this was harmless because inserts used
   `ON CONFLICT DO NOTHING`. That's not actually true here: `crop_catalog`,
   `government_schemes`, and `knowledge_articles` had **no unique constraint**
   on their natural key columns (`crop_name`, `scheme_name`, `title`) — only
   a `PRIMARY KEY (id)` with a fresh random UUID on every insert. With no
   matching constraint, `ON CONFLICT DO NOTHING` has nothing to conflict on,
   so running the seed migration twice really did insert every crop,
   scheme, and article twice. A new migration,
   `20260724060000_add_reference_data_unique_constraints.sql`, removes any
   existing duplicates and adds the missing unique constraints so this can't
   happen again.

2. **Missing `supabase/config.toml` and folder structure.** Added (generated
   with `supabase init` and trimmed), so `supabase link` / `db push` /
   `functions deploy` work directly against this repo.

3. **Frontend, backend function, and database schema were cross-checked
   against each other** — every table the frontend queries
   (`.from('...')`) exists in a migration, every column used by
   `types/database.ts` matches the SQL, and the edge-function name called
   from `app/app/ai/page.tsx` (`ai-assistant`) matches the deployed
   function folder. `npm install`, `tsc --noEmit`, and `next build` all
   succeed with no code errors — the frontend itself was already solid, no
   code changes were needed there.

## Deploy order

Push this whole repo to GitHub as one commit — internal file order doesn't
matter to Git — but **deploy in this order**, since the frontend needs the
Supabase project to already exist:

1. **Database** — create a free project at supabase.com, then from repo root:
   ```
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
   This runs all 9 files in `supabase/migrations/` in order.

2. **Backend (Edge Function)**:
   ```
   supabase functions deploy ai-assistant
   ```
   Optional, for real AI answers instead of the rule-based fallback:
   ```
   supabase secrets set OPENAI_API_KEY=your-key-here
   ```

3. **Frontend** — grab your Project URL and anon key from
   Supabase → Settings → API, then deploy `frontend/` to Netlify:
   - Netlify → Add new site → Import from GitHub → pick this repo
   - **Base directory**: `frontend`
   - Add env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy (build command / publish dir already set in `frontend/netlify.toml`)
