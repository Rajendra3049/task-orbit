"use client";

import { format, isPast, isToday, parseISO } from "date-fns";
import { CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { TaskEditDialog } from "@/features/tasks/components/task-edit-dialog";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useDeleteTask, useToggleTaskCompletion } from "@/features/tasks/hooks/use-tasks";
import { Task } from "@/features/tasks/types/task.types";
import { cn } from "@/shared/lib/utils";

type TaskTableViewProps = {
  tasks: Task[];
};

const STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
} as const;

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "—";
  const date = parseISO(dueDate);
  if (isToday(date)) return "Today";
  return format(date, "MMM d, yyyy");
}

function dueDateClassName(dueDate: string | null, isCompleted: boolean) {
  if (!dueDate || isCompleted) return "text-muted-foreground";
  const date = parseISO(dueDate);
  if (isPast(date) && !isToday(date)) return "text-danger font-medium";
  if (isToday(date)) return "text-warning font-medium";
  return "text-muted-foreground";
}

export function TaskTableView({ tasks }: TaskTableViewProps) {
  const { data: projects } = useProjects();
  const toggleTask = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    (projects ?? []).forEach((project) => map.set(project.id, project.name));
    return map;
  }, [projects]);

  const handleDelete = (task: Task) => {
    const shouldDelete = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!shouldDelete) return;
    deleteTask.mutate(task.id);
    setOpenMenuId(null);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No tasks match your filters. Create one to get started.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated/60">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground"> </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Task</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Due date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Context</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Project</th>
                <th className="px-4 py-3 font-medium text-muted-foreground"> </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b border-border/70 transition-colors hover:bg-surface-elevated/40",
                    task.isCompleted && "opacity-70",
                  )}
                >
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
                      onClick={() => toggleTask.mutate(task.id)}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-left"
                      onClick={() => setEditingTask(task)}
                    >
                      <p className={cn("font-medium", task.isCompleted && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      {task.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                      ) : null}
                      {task.isRecurring ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">Recurring · {task.recurrencePattern}</p>
                      ) : null}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3", dueDateClassName(task.dueDate, task.isCompleted))}>
                    {formatDueDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{task.context}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.projectId ? projectNameById.get(task.projectId) ?? "—" : "—"}
                  </td>
                  <td className="relative px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${task.title}`}
                      onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                    {openMenuId === task.id ? (
                      <div className="absolute right-4 top-12 z-10 min-w-[140px] rounded-lg border border-border bg-surface p-1 shadow-lg">
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-elevated"
                          onClick={() => {
                            setEditingTask(task);
                            setOpenMenuId(null);
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-danger hover:bg-surface-elevated"
                          onClick={() => handleDelete(task)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TaskEditDialog task={editingTask} onClose={() => setEditingTask(null)} />
    </>
  );
}
