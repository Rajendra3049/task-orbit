# Tasks Context

## Data model assumptions

- Task belongs to one user
- Optional project linkage
- Optional recurring schedule
- Due dates are timezone-sensitive in display layer

## UX principles

- Task actions should feel instant (optimistic updates).
- Destructive actions require confirmation.
- Empty states should always suggest next action.
