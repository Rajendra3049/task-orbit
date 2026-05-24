# TaskOrbit Implementation Plan

## Delivery approach

TaskOrbit is delivered using vertical slices to keep code stable and AI-friendly:

1. Foundation and architecture
2. Auth and workspace
3. Tasks core
4. Dashboard widgets
5. Notes
6. Habits
7. Calendar
8. AI layer
9. Realtime and offline
10. Monetization and launch

## Implemented in this repository (Phase 1 MVP foundation)

- Monorepo + workspace tooling
- Feature-driven Next.js web structure
- Dashboard shell and navigation
- Personal/Office mode toggle with UI adaptation
- Supabase-backed auth, protected routes, and verification UX
- Task CRUD + inbox/today/overdue/upcoming/completed views
- Projects, habits, goals, analytics, assistant, and workspace foundations
- Calendar agenda + weekly planner scheduling interactions
- Supabase schema and RLS starter script

## Next milestones

### Milestone A - Production hardening

- Expand automated test coverage (unit + integration + e2e)
- Add robust undo flows and activity logs for destructive changes
- Add role/invite lifecycle for collaboration

### Milestone B - Integrations and automation

- Wire real integration OAuth flows and sync jobs
- Add recurring automation scheduler through Supabase jobs
- Add notification delivery channels (email/push/in-app)

### Milestone C - Advanced intelligence

- Connect assistant to LLM provider with preview and confidence states
- Add date-range analytics and trend exploration
- Add recommendation engine for scheduling and prioritization
