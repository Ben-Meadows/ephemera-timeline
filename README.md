# Ephemera Timeline

A minimal MVP for annotating junk journal pages: upload images, drop markers, and keep a timeline of pages. Built with Next.js 15 (App Router), Supabase (Auth/Postgres/Storage/RLS), Tailwind CSS, Zod, and react-hook-form. Deploy-ready for Vercel.

## Stack
- Next.js 16 / React 19 (App Router, server actions)
- TypeScript (strict)
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, RLS)
- Zod + react-hook-form

## Getting started
1. Install deps
   ```bash
   npm install
   ```
2. Create `.env.local`
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Configure Supabase
   - Run the SQL in `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`). It creates tables, indexes, RLS policies, and the `journal-pages` storage bucket (public read).
   - Ensure email/password auth is enabled in Supabase Auth settings.
4. Start dev server
   ```bash
   npm run dev
   ```
5. (Optional) Create a demo user via Supabase Auth -> Users (or sign up through the app once running).

## Routes
- `/` landing
- `/auth/sign-in`, `/auth/sign-up`
- `/timeline` (auth) — your pages
- `/new` (auth) — upload page + metadata
- `/p/[id]` page detail with annotation canvas
- `/u/[username]` public profile timeline (public/unlisted pages)

## Data model
See `supabase/migrations/0001_init.sql` for full DDL + RLS.
- `profiles` (id, username, display_name, avatar_url)
- `journal_pages` (title, page_date, caption, visibility, image_path)
- `page_items` (x,y normalized, label, note, category, source_date, source_location)
- Storage bucket: `journal-pages` at `user_id/page_id/original.ext`

## Auth and permissions
- Supabase email/password auth.
- RLS ensures owners manage their own pages/items; public/unlisted pages (and their markers) are readable by anyone.
- Storage policies allow public read; authenticated users can write to the bucket.

## Deployment
- Set env vars on Vercel (same as `.env.local`).
- Add `*.supabase.co` to remote image domains (already in `next.config.ts`).
- Run the migration SQL in your production Supabase project before deploying.

## Notes / future
- Drag-to-move markers and social features are out of scope for this MVP but can be layered on top of the current schema.
