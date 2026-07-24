# Frontend (Next.js)

This is your Next.js app — pages, components, hooks, and Supabase client code.
It talks directly to your Supabase project (database + backend function).

## Setup
1. Rename `.env.example` to `.env` and fill in:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   (Get these from your Supabase project → Settings → API)

2. Install & run locally:
   npm install
   npm run dev

## Deploy for free
Deploy on Netlify (config already included in `netlify.toml`):
1. Push the repo (this folder + the sibling `../supabase` folder) to GitHub
2. netlify.com → Add new site → Import from GitHub
3. Set **Base directory** to `frontend`
4. Add the two environment variables above in Netlify's dashboard
5. Deploy

Note: This app has no separate backend server — it calls Supabase directly.
Make sure the `../supabase` folder (migrations + the `ai-assistant`
function) is deployed to your Supabase project first — see
`../supabase/README.md` — so the URL/keys above are valid.
