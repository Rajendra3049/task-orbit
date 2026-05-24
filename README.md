# TaskOrbit

TaskOrbit is an AI-first productivity operating system for life and work.

## Current status

This repository now includes a working **Phase 1 MVP foundation**:

- Monorepo setup with Turbo + Yarn workspaces
- Next.js 16 web app in `apps/web`
- Feature-driven architecture
- Premium dark-first shell UI with personal/office mode toggle
- Task vertical slice (create/list/toggle complete)
- Dashboard + Today + Tasks pages
- Supabase schema and RLS starter SQL

## Quick start

```bash
yarn install
yarn dev
```

Open `http://localhost:3000`.

## Environment variables

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Apply database schema

Run `apps/web/supabase/schema.sql` in your Supabase SQL editor.

## Supabase auth setup

- In Supabase Auth, enable Email + Password and Google (optional)
- Add redirect URL: `http://localhost:3000/auth/callback`

## Commands

- `yarn dev` - run all workspace dev servers
- `yarn lint` - lint workspace
- `yarn typecheck` - TypeScript checks
- `yarn build` - production build
