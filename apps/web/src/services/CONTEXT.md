# Services Context

## Purpose

Encapsulate external integrations and infrastructure setup so features depend on stable abstractions.

## Rules

- Keep auth/session handling centralized.
- Avoid importing UI-layer modules here.
- Service helpers should be deterministic and side-effect scoped.
