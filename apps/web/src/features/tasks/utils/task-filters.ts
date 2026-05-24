import { isAfter, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { Task } from "@/features/tasks/types/task.types";
import { WorkspaceMode } from "@/shared/store/ui-store";

export type TaskView = "all" | "today" | "overdue" | "upcoming" | "completed" | "inbox";

export function applyModeFilter(tasks: Task[], mode: WorkspaceMode) {
  if (mode === "office") {
    return tasks.filter((task) => task.context !== "personal");
  }
  return tasks;
}

export function filterByView(tasks: Task[], view: TaskView) {
  const today = startOfDay(new Date());

  switch (view) {
    case "completed":
      return tasks.filter((task) => task.isCompleted);
    case "inbox":
      return tasks.filter((task) => !task.dueDate && !task.isCompleted);
    case "today":
      return tasks.filter((task) => task.dueDate && isToday(parseISO(task.dueDate)));
    case "overdue":
      return tasks.filter(
        (task) => task.dueDate && !task.isCompleted && isBefore(parseISO(task.dueDate), today),
      );
    case "upcoming":
      return tasks.filter(
        (task) => task.dueDate && !task.isCompleted && isAfter(parseISO(task.dueDate), today),
      );
    case "all":
    default:
      return tasks;
  }
}

export function applySearchFilter(tasks: Task[], searchQuery: string) {
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    return tasks;
  }
  return tasks.filter((task) => task.title.toLowerCase().includes(q));
}
