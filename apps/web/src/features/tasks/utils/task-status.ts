import { TaskStatus } from "@/features/tasks/types/task.types";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

/** Tailwind classes for status chips and inline selects. */
export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-surface-elevated text-muted-foreground border-border",
  in_progress: "bg-warning/20 text-warning border-warning/30",
  done: "bg-success/20 text-success border-success/30",
};
