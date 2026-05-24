# TaskOrbit Architecture

## Repository layout

- `apps/web` - Next.js web application
- `docs` - architecture and planning docs

## Web app architecture

`apps/web/src` is organized by business feature and runtime responsibility:

- `app` - route tree and route-level loading/error boundaries
- `features` - domain modules (tasks, projects, habits, goals, etc.)
- `components/ui` - reusable UI primitives
- `shared` - cross-feature hooks/stores/constants/providers
- `services` - infrastructure clients (Supabase)
- `config` - runtime environment config

## Feature module pattern

Each feature follows a predictable layout where relevant:

- `components` - UI components
- `hooks` - React query hooks and local interactions
- `services` - Supabase API access and business logic
- `types` - domain types
- `validations` / `utils` - validation and deterministic helpers

## Data and state strategy

- Server state: TanStack Query
- Client UI state: Zustand (mode/sidebar)
- Persistence: Supabase tables with RLS policies
- Realtime: Supabase realtime subscriptions (tasks)

## Reliability strategy

- Route-level loading boundaries for transition feedback
- Route-level error boundaries for retry and recovery
- Optimistic updates with rollback for core mutations
- Confirmation guard for destructive actions

## Security

- Auth: Supabase auth session
- Data isolation: RLS policies on all user-owned tables
- No client access to privileged backend keys
