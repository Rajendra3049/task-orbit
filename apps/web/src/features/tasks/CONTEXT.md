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
  - Today uses compact "today-first" capture with expandable more options (description, project, recurring).
  - Tasks uses collapsible capture to reduce visual repetition.
- Tasks page supports two views:
  - **List** — Slack-style table with sortable columns, inline status dropdown, and row actions.
  - **Dashboard** — Kanban board grouped by status (To do / In progress / Done).
- Inbox and Today pages support two views:
  - **Cards** — sectioned card grids with inline status, priority, project, and due-date colors.
  - **List** — combined table view with the same row actions as `/tasks`.
- Tasks page tabs: **All** and **Completed** (no separate Active tab).
- Inbox/Today tabs: **All** and **Completed** (page-scoped completed lists).
- Shared filters and sorting apply across list and card views (priority, status, context, project, search, sort).
- Due-date filter is available on `/tasks` only; Inbox/Today rely on section segmentation instead.
- Recurrence pattern is shown only when recurring is enabled.
- Full edit/delete is available via the task edit dialog from list, dashboard, and cards.
- Stat cards on Inbox/Today are clickable — filter a section, open completed, or navigate to the other page.
