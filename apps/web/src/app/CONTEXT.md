# App Context

## Responsibilities

- Own route composition and navigation boundaries.
- Keep page files thin by delegating business UI to `features/*`.
- Provide fallback states (`loading`, `error`) per route segment.

## Guardrails

- Do not embed Supabase data queries directly in pages unless server-rendering requires it.
- Keep page components orchestration-only.
