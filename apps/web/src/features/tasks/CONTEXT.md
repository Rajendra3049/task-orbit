# Tasks Context

## Data model assumptions

- Task belongs to one user
- Optional project linkage
- Optional recurring schedule
- Optional description for richer context
- Due dates are timezone-sensitive in display layer
- Priority uses P0–P3 scale (P0 critical → P3 low)

## UX principles

- Task actions should feel instant (optimistic updates).
- Destructive actions require confirmation.
- Empty states should always suggest next action.
- Capture UI is intentionally variant-based by route:
  - Inbox uses full capture form.
  - Today uses compact "today-first" capture.
  - Tasks uses collapsible capture to reduce visual repetition.
- Tasks page supports two views:
  - **List** — Slack-style table with sortable columns, inline status dropdown, and row actions.
  - **Dashboard** — Kanban board grouped by status (To do / In progress / Done).
- Tasks page tabs: **All** and **Completed** (no separate Active tab).
- Shared filters and sorting apply to both list and dashboard views (priority, status, context, due date, project, search, sort).
- Recurrence pattern is shown only when recurring is enabled.
- Full edit/delete is available via the task edit dialog from list, dashboard, and cards.
