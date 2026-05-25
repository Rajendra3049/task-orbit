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
  "h-11 w-full cursor-pointer rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export const textareaFieldClassName =
  "min-h-[88px] w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-surface-elevated focus:ring-2 focus:ring-primary/30";
