# TaskOrbit

TaskOrbit is a fullstack productivity operating system that combines tasks, projects, habits, goals, calendar planning, analytics, workspace foundations, and AI-assisted capture in a single app.

## Product modules currently implemented

- Authentication and email verification
- Dashboard, inbox, tasks, today views
- Projects, habits, goals
- Calendar agenda + weekly planner drag/drop scheduling
- Analytics overview and AI command panel
- Workspace foundation and pricing page
- Settings with mode persistence (personal/office)

## Tech stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- State/data: TanStack Query, Zustand
- Backend: Supabase Auth + Postgres + Realtime + RLS
- Tooling: Yarn workspaces, Turbo, ESLint

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

## Database setup

Run `apps/web/supabase/schema.sql` in Supabase SQL Editor.

## Supabase auth setup

- Enable Email + Password in Supabase Auth providers
- Add redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback` (used when port 3000 is already taken)

## Supabase troubleshooting

If signup/login shows **Failed to fetch** or the terminal logs `ENOTFOUND` / `521` for your Supabase URL:

1. Open your [Supabase dashboard](https://supabase.com/dashboard) and confirm the project is **Active** (not paused). Restore it if needed and wait a few minutes.
2. In **Authentication → URL configuration**, add both localhost callback URLs above.
3. In the **SQL Editor**, run the full contents of `apps/web/supabase/schema.sql`.
4. Restart the dev server: stop `yarn dev`, then run it again.
5. If auth still returns **Database error finding user**, create a fresh Supabase project, update `apps/web/.env.local`, and rerun the schema.

## Development commands

- `yarn guard:docs` - ensure docs/context updated for code changes
- `yarn dev` - run development server
- `yarn lint` - lint project
- `yarn typecheck` - run TypeScript checks
- `yarn build` - production build

## Contribution docs

- Project contribution process: `CONTRIBUTING.md`
- High-level architecture: `docs/ARCHITECTURE.md`
- Delivery roadmap and phase view: `docs/implementation-plan.md`
- Feature/module context docs: `apps/web/src/**/README.md` and `CONTEXT.md`
