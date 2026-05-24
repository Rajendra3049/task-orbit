# App Routes

This folder contains Next.js App Router routes.

- Route groups:
  - `(auth)` authentication flows
  - `(dashboard)` signed-in product surfaces
- Shared route handlers:
  - `auth/callback`
  - `auth/verify-email`

Use route-level `loading.tsx` and `error.tsx` for transition and resilience UX.
