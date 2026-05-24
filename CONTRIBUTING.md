# Contributing Guide

## Goals

This repository is structured so both human contributors and AI coding assistants can make safe, incremental changes with low regression risk.

## Development workflow

1. Read the relevant module `README.md` and `CONTEXT.md` first.
2. Implement changes in vertical slices (feature + data + UI + states).
3. Keep files focused and avoid large multi-purpose components.
4. Prefer extending existing hooks/services over adding parallel patterns.
5. Update docs/context for touched modules.
6. Run all quality checks before handing off:
   - `yarn guard:docs`
   - `yarn lint`
   - `yarn typecheck`
   - `yarn build`

## Documentation guard (enforced)

This project enforces a docs-update rule through `scripts/enforce-doc-updates.mjs`.

If implementation files change, at least one documentation/context file must also change:

- `CONTRIBUTING.md`
- `docs/ARCHITECTURE.md`
- `docs/implementation-plan.md`
- `apps/web/src/**/README.md`
- `apps/web/src/**/CONTEXT.md`

The guard runs automatically in `yarn lint`.

## Coding standards

- TypeScript strict mode only.
- Avoid `any`; prefer explicit domain types.
- UI side effects belong in hooks/services, not in presentational blocks.
- Keep error messages actionable and user-friendly.
- For destructive actions, require confirmation or undo pattern.

## Data layer rules

- Use Supabase with RLS-enabled tables only.
- Never bypass user scoping in queries.
- Add SQL migrations to `apps/web/supabase/schema.sql`.
- If schema changes are required, always include runnable SQL in PR notes.

## UX standards

- Every async surface must handle loading, empty, error, and success states.
- Use clear placeholders and helper text.
- Provide keyboard-friendly alternatives for drag/drop interactions.
- Keep labels and call-to-action text specific.

## AI contribution protocol

- Read module context docs before editing:
  - `README.md` for structure/entry points
  - `CONTEXT.md` for domain assumptions and constraints
- Preserve naming consistency and feature boundaries.
- Do not introduce hidden coupling between unrelated modules.
