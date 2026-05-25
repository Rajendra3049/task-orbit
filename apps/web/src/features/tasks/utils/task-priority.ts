import { TaskPriority } from "@/features/tasks/types/task.types";

export const TASK_PRIORITIES: TaskPriority[] = ["p0", "p1", "p2", "p3"];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  p0: "P0 · Critical",
  p1: "P1 · High",
  p2: "P2 · Medium",
  p3: "P3 · Low",
};

export const PRIORITY_SHORT: Record<TaskPriority, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3",
};

/** Tailwind classes for priority chips (Slack-style severity colors). */
export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  p0: "bg-danger/20 text-danger border-danger/30",
  p1: "bg-warning/20 text-warning border-warning/30",
  p2: "bg-primary/20 text-primary border-primary/30",
  p3: "bg-surface-elevated text-muted-foreground border-border",
};

const LEGACY_PRIORITY_MAP: Record<string, TaskPriority> = {
  high: "p0",
  medium: "p1",
  low: "p2",
  p0: "p0",
  p1: "p1",
  p2: "p2",
  p3: "p3",
};

export function normalizePriority(value: string | null | undefined): TaskPriority {
  if (!value) return "p2";
  return LEGACY_PRIORITY_MAP[value] ?? "p2";
}

export const selectFieldClassName =
  "h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-input)] border border-border bg-surface bg-[length:16px] bg-[position:right_12px_center] bg-no-repeat pl-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [background-image:url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2396a0b5%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

export const textareaFieldClassName =
  "min-h-[88px] w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-surface-elevated focus:ring-2 focus:ring-primary/30";
