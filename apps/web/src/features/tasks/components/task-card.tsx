"use client";

import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { TaskEditDialog } from "@/features/tasks/components/task-edit-dialog";
import { useDeleteTask, useToggleTaskCompletion, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { dueDateClassName, formatDueDate } from "@/features/tasks/utils/task-dates";
import { selectFieldClassName } from "@/features/tasks/utils/task-priority";
import { STATUS_LABELS, STATUS_STYLES, TASK_STATUSES } from "@/features/tasks/utils/task-status";
import { cn } from "@/shared/lib/utils";

type TaskCardProps = {
  task: Task;
  projectName?: string | null;
};

const compactSelectClassName = `${selectFieldClassName} h-8 min-w-[120px] py-1 text-xs font-medium`;

export function TaskCard({ task, projectName }: TaskCardProps) {
  const toggleTask = useToggleTaskCompletion();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = () => {
    const shouldDelete = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!shouldDelete) return;
    deleteTask.mutate(task.id);
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (task.status === status) return;
    setIsUpdatingStatus(true);
    updateTask.mutate(
      { taskId: task.id, payload: { status } },
      { onSettled: () => setIsUpdatingStatus(false) },
    );
  };

  return (
    <>
      <Card className="space-y-3 p-4 transition-colors hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <button
              type="button"
              className="cursor-pointer text-left"
              onClick={() => setIsEditOpen(true)}
            >
              <h3
                className={cn(
                  "text-base font-semibold hover:text-primary",
                  task.isCompleted && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
            </button>
            {task.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
            ) : null}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`task-card-status-${task.id}`} className="sr-only">
            Status for {task.title}
          </label>
          <select
            id={`task-card-status-${task.id}`}
            className={cn(compactSelectClassName, STATUS_STYLES[task.status])}
            value={task.status}
            disabled={isUpdatingStatus}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleStatusChange(event.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {projectName ? (
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">
              {projectName}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-xs", dueDateClassName(task.dueDate, task.isCompleted))}>
            {formatDueDate(task.dueDate)}
            {task.isRecurring ? ` · Recurring ${task.recurrencePattern}` : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditOpen(true)}
              aria-label={`Edit ${task.title}`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTask.mutate(task.id)}
              aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete this task permanently"
              onClick={handleDelete}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        </div>
      </Card>

      <TaskEditDialog task={isEditOpen ? task : null} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
