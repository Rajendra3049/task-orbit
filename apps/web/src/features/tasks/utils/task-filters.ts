import { isAfter, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { Task, TaskContext, TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";
import { PRIORITY_LABELS } from "@/features/tasks/utils/task-priority";
import { WorkspaceMode } from "@/shared/store/ui-store";

export type TaskView = "all" | "today" | "overdue" | "upcoming" | "completed" | "inbox";

export type TaskCompletionTab = "all" | "completed";

export type TaskDueFilter = "all" | "overdue" | "today" | "upcoming" | "none";

export type TaskSortOption =
  | "due_date_asc"
  | "due_date_desc"
  | "priority_asc"
  | "priority_desc"
  | "created_desc"
  | "created_asc"
  | "title_asc"
  | "title_desc"
  | "updated_desc";

export type TaskListQuery = {
  search: string;
  completion: TaskCompletionTab;
  priority: TaskPriority | "all";
  status: TaskStatus | "all";
  context: TaskContext | "all";
  due: TaskDueFilter;
  projectId: string | "all";
  sort: TaskSortOption;
};

export const DEFAULT_TASK_LIST_QUERY: TaskListQuery = {
  search: "",
  completion: "all",
  priority: "all",
  status: "all",
  context: "all",
  due: "all",
  projectId: "all",
  sort: "due_date_asc",
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  p0: 0,
  p1: 1,
  p2: 2,
  p3: 3,
};

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
  return tasks.filter((task) => {
    const matchesTitle = task.title.toLowerCase().includes(q);
    const matchesDescription = task.description?.toLowerCase().includes(q) ?? false;
    const matchesContext = task.context.toLowerCase().includes(q);
    const matchesPriority =
      task.priority.includes(q) || PRIORITY_LABELS[task.priority].toLowerCase().includes(q);
    return matchesTitle || matchesDescription || matchesContext || matchesPriority;
  });
}

export type TaskPageVariant = "inbox" | "today";

export function getPageCompletedTasks(tasks: Task[], variant: TaskPageVariant) {
  const completed = tasks.filter((task) => task.isCompleted);
  if (variant === "inbox") {
    return completed.filter((task) => !task.dueDate);
  }
  return completed.filter((task) => task.dueDate && isToday(parseISO(task.dueDate)));
}

/** Filters and sort for section-based pages (inbox/today) — excludes due-date filter. */
export function applySectionQuery(tasks: Task[], query: TaskListQuery) {
  let result = [...tasks];

  result = applySearchFilter(result, query.search);

  if (query.priority !== "all") {
    result = result.filter((task) => task.priority === query.priority);
  }

  if (query.status !== "all") {
    result = result.filter((task) => task.status === query.status);
  }

  if (query.context !== "all") {
    result = result.filter((task) => task.context === query.context);
  }

  if (query.projectId !== "all") {
    result = result.filter((task) => task.projectId === query.projectId);
  }

  return sortTasks(result, query.sort);
}

function applyDueFilter(tasks: Task[], due: TaskDueFilter) {
  if (due === "all") return tasks;

  const today = startOfDay(new Date());

  switch (due) {
    case "overdue":
      return tasks.filter(
        (task) => task.dueDate && !task.isCompleted && isBefore(parseISO(task.dueDate), today),
      );
    case "today":
      return tasks.filter((task) => task.dueDate && isToday(parseISO(task.dueDate)));
    case "upcoming":
      return tasks.filter(
        (task) => task.dueDate && !task.isCompleted && isAfter(parseISO(task.dueDate), today),
      );
    case "none":
      return tasks.filter((task) => !task.dueDate);
    default:
      return tasks;
  }
}

export function applyTaskListQuery(tasks: Task[], query: TaskListQuery) {
  let result = [...tasks];

  result = applySearchFilter(result, query.search);

  if (query.completion === "completed") {
    result = result.filter((task) => task.isCompleted);
  }

  if (query.priority !== "all") {
    result = result.filter((task) => task.priority === query.priority);
  }

  if (query.status !== "all") {
    result = result.filter((task) => task.status === query.status);
  }

  if (query.context !== "all") {
    result = result.filter((task) => task.context === query.context);
  }

  if (query.projectId !== "all") {
    result = result.filter((task) => task.projectId === query.projectId);
  }

  result = applyDueFilter(result, query.due);

  return sortTasks(result, query.sort);
}

function compareNullableDates(a: string | null, b: string | null, direction: "asc" | "desc") {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const diff = new Date(a).getTime() - new Date(b).getTime();
  return direction === "asc" ? diff : -diff;
}

export function sortTasks(tasks: Task[], sort: TaskSortOption) {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    switch (sort) {
      case "due_date_asc":
        return compareNullableDates(a.dueDate, b.dueDate, "asc");
      case "due_date_desc":
        return compareNullableDates(a.dueDate, b.dueDate, "desc");
      case "priority_asc":
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case "priority_desc":
        return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      case "created_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "created_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "updated_desc":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  return sorted;
}
