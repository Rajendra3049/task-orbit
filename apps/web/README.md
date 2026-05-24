# TaskOrbit Web App

This is the web client for TaskOrbit, built with Next.js App Router + TypeScript.

## Structure

- `src/app` - route groups and pages
- `src/features` - feature modules (`dashboard`, `tasks`, etc.)
- `src/components/ui` - shared UI primitives
- `src/shared` - global utilities, providers, constants, stores
- `src/services` - external service clients
- `supabase/schema.sql` - starter DB schema + RLS policies

## Run locally

From repository root:

```bash
yarn dev
```
