"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { TaskEditDialog } from "@/features/tasks/components/task-edit-dialog";
import { useToggleTaskCompletion, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { cn } from "@/shared/lib/utils";

type TaskDashboardViewProps = {
  tasks: Task[];
};

const COLUMNS: Array<{ status: TaskStatus; label: string; hint: string }> = [
  { status: "todo", label: "To do", hint: "Not started" },
  { status: "in_progress", label: "In progress", hint: "Active work" },
  { status: "done", label: "Done", hint: "Completed" },
];

export function TaskDashboardView({ tasks }: TaskDashboardViewProps) {
  const toggleTask = useToggleTaskCompletion();
  const updateTask = useUpdateTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksByStatus = COLUMNS.reduce(
    (acc, column) => {
      acc[column.status] = tasks.filter((task) => task.status === column.status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  const moveTask = (task: Task, nextStatus: TaskStatus) => {
    if (task.status === nextStatus) return;
    updateTask.mutate({ taskId: task.id, payload: { status: nextStatus } });
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <Card key={column.status} className="space-y-3 bg-surface-elevated/30">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold">{column.label}</h3>
                <p className="text-xs text-muted-foreground">{column.hint}</p>
              </div>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                {tasksByStatus[column.status].length}
              </span>
            </div>

            <div className="space-y-2">
              {tasksByStatus[column.status].length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  No tasks in this column
                </p>
              ) : (
                tasksByStatus[column.status].map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded-xl border border-border bg-surface p-3 shadow-sm transition hover:border-primary/40",
                      task.isCompleted && "opacity-80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={task.priority} />
                          <span className="text-xs capitalize text-muted-foreground">{task.context}</span>
                        </div>
                        <button
                          type="button"
                          className="mt-2 cursor-pointer text-left font-medium"
                          onClick={() => setEditingTask(task)}
                        >
                          <span className={cn(task.isCompleted && "line-through text-muted-foreground")}>{task.title}</span>
                        </button>
                        {task.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit task"
                        onClick={() => setEditingTask(task)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {task.dueDate ? format(parseISO(task.dueDate), "MMM d") : "No due date"}
                        {task.isRecurring ? ` · ${task.recurrencePattern}` : ""}
                      </p>
                      <div className="flex items-center gap-1">
                        {column.status !== "todo" ? (
                          <Button variant="ghost" size="default" className="h-7 px-2 text-xs" onClick={() => moveTask(task, "todo")}>
                            To do
                          </Button>
                        ) : null}
                        {column.status !== "in_progress" ? (
                          <Button
                            variant="ghost"
                            size="default"
                            className="h-7 px-2 text-xs"
                            onClick={() => moveTask(task, "in_progress")}
                          >
                            Start
                          </Button>
                        ) : null}
                        {column.status !== "done" ? (
                          <Button variant="ghost" size="default" className="h-7 px-2 text-xs" onClick={() => moveTask(task, "done")}>
                            Done
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
                          onClick={() => toggleTask.mutate(task.id)}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="size-3.5 text-success" />
                          ) : (
                            <Circle className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      <TaskEditDialog task={editingTask} onClose={() => setEditingTask(null)} />
    </>
  );
}
