"use client";

import { cn } from "@/shared/lib/utils";
import { TaskPriority } from "@/features/tasks/types/task.types";
import { PRIORITY_SHORT, PRIORITY_STYLES } from "@/features/tasks/utils/task-priority";

type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        PRIORITY_STYLES[priority],
        className,
      )}
    >
      {PRIORITY_SHORT[priority]}
    </span>
  );
}
