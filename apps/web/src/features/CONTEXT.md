# Features Context

## Purpose

Keep business logic and UI behavior modular, predictable, and easy to scale for both humans and AI contributors.

## Rules

- Avoid cross-feature coupling unless explicitly shared via `shared/*`.
- Query and mutation logic should live in feature hooks/services.
- Feature components should remain focused and composable.
- Domain terminology should be consistent with table and type names.

## Common anti-patterns to avoid

- Creating global utility files for feature-specific logic.
- Writing Supabase query code directly in page-level components.
- Duplicating the same state transformations across modules.
