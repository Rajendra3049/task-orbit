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
- Task CRUD MVP (create/list/toggle complete with persisted local fallback)
- Today page and dashboard summary widgets
- Supabase schema and RLS starter script

## Next milestones

### Milestone A - Supabase integration hardening

- Switch task service from local storage to Supabase queries/mutations
- Add auth middleware and protected routes
- Persist mode in `settings` table

### Milestone B - Productivity workflows

- Inbox capture flow
- Overdue grouping and smart suggestions
- Notification center and browser reminders

### Milestone C - Analytics and intelligence

- Productivity score widgets
- Weekly trends chart
- AI prompt/action layer for natural language task parsing
