# Accessibility Checklist

Use this checklist before merging UI changes in TaskOrbit.

## Form semantics

- Every form control has an explicit label (`label` + `htmlFor`/`id`), or an `sr-only` label where visible labels would hurt compact UI.
- Required fields are marked with `required` and have clear helper text.
- Validation states use `aria-invalid` where applicable.
- Helper/error text is linked with `aria-describedby`.

## Keyboard and focus

- All interactive elements are reachable with keyboard only (`Tab`, `Shift+Tab`, `Enter`, `Space`).
- Focus order follows visual reading order.
- Raw interactive elements (`button`, `a`, custom controls) have visible `focus-visible` styles.
- Keyboard users can complete core journeys (auth, create/edit/delete tasks, planner actions) without a mouse.

## Buttons, links, and icon controls

- Icon-only controls have meaningful accessible names (`aria-label`).
- Destructive actions are clearly named and confirmed when needed.
- Toggle controls expose state (`aria-pressed` for toggle buttons, `aria-selected` for tab-like controls).
- Links and buttons have clear purpose text (avoid vague labels like "Click here").

## Status, async states, and feedback

- Loading states are announced or visually obvious.
- Error/success status regions use appropriate live semantics (`role="status"`, `aria-live`) when needed.
- Disabled states explain why an action is unavailable (helper text, tooltip, or nearby hint).

## Content clarity

- Placeholders are examples, not replacements for labels.
- Labels and CTA copy are action-oriented and specific.
- Time/date language is timezone-aware when relevant.

## Quick manual QA script

1. Open `/login`, complete sign-in and create-account flow using keyboard only.
2. Create/edit/delete entities: task, project, habit, goal, workspace.
3. Verify planner select controls and task scheduling without mouse.
4. Navigate sidebar and top search via keyboard.
5. Run lint/typecheck/build:
   - `yarn lint`
   - `yarn typecheck`
   - `yarn build`
