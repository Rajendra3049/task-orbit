"use client";

import { format, isPast, isToday, parseISO } from "date-fns";
import { CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { TaskEditDialog } from "@/features/tasks/components/task-edit-dialog";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useDeleteTask, useToggleTaskCompletion, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { selectFieldClassName } from "@/features/tasks/utils/task-priority";
import { STATUS_LABELS, STATUS_STYLES, TASK_STATUSES } from "@/features/tasks/utils/task-status";
import { cn } from "@/shared/lib/utils";

type TaskTableViewProps = {
  tasks: Task[];
};

type MenuAnchor = {
  task: Task;
  top: number;
  left: number;
};

const MENU_WIDTH = 152;
const MENU_HEIGHT = 88;

const compactSelectClassName = `${selectFieldClassName} h-8 min-w-[132px] py-1 text-xs font-medium`;

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
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [updatingStatusTaskId, setUpdatingStatusTaskId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    (projects ?? []).forEach((project) => map.set(project.id, project.name));
    return map;
  }, [projects]);

  useEffect(() => {
    if (!menuAnchor) return;

    const closeMenu = () => setMenuAnchor(null);

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menuAnchor]);

  const openActionsMenu = (task: Task, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < MENU_HEIGHT + 12;

    setMenuAnchor({
      task,
      top: openUpward ? rect.top - MENU_HEIGHT - 8 : rect.bottom + 8,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    setUpdatingStatusTaskId(task.id);
    updateTask.mutate(
      { taskId: task.id, payload: { status } },
      { onSettled: () => setUpdatingStatusTaskId(null) },
    );
  };

  const handleDelete = (task: Task) => {
    const shouldDelete = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!shouldDelete) return;
    deleteTask.mutate(task.id);
    setMenuAnchor(null);
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
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated/60">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground"> </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Task</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Due date</th>
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
                      <p className={cn("font-medium hover:text-primary", task.isCompleted && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                    </button>
                    {task.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                    ) : null}
                    {task.isRecurring ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">Recurring · {task.recurrencePattern}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <label htmlFor={`task-status-${task.id}`} className="sr-only">
                      Status for {task.title}
                    </label>
                    <select
                      id={`task-status-${task.id}`}
                      className={cn(compactSelectClassName, STATUS_STYLES[task.status])}
                      value={task.status}
                      disabled={updatingStatusTaskId === task.id}
                      onChange={(event) => handleStatusChange(task, event.target.value as TaskStatus)}
                    >
                      {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={cn("px-4 py-3", dueDateClassName(task.dueDate, task.isCompleted))}>
                    {formatDueDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.projectId ? projectNameById.get(task.projectId) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${task.title}`}
                      aria-expanded={menuAnchor?.task.id === task.id}
                      onClick={(event) => {
                        if (menuAnchor?.task.id === task.id) {
                          setMenuAnchor(null);
                          return;
                        }
                        openActionsMenu(task, event.currentTarget);
                      }}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {menuAnchor && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label={`Actions for ${menuAnchor.task.title}`}
              className="fixed z-[100] min-w-[152px] rounded-xl border border-border bg-background-secondary p-1.5 text-foreground shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
              style={{ top: menuAnchor.top, left: menuAnchor.left }}
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-elevated"
                onClick={() => {
                  setEditingTask(menuAnchor.task);
                  setMenuAnchor(null);
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-surface-elevated"
                onClick={() => handleDelete(menuAnchor.task)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>,
            document.body,
          )
        : null}

      <TaskEditDialog task={editingTask} onClose={() => setEditingTask(null)} />
    </>
  );
}
