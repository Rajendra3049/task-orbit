"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { TaskDashboardView } from "@/features/tasks/components/task-dashboard-view";
import { TaskTableView } from "@/features/tasks/components/task-table-view";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import {
  applyModeFilter,
  applyTaskListQuery,
  DEFAULT_TASK_LIST_QUERY,
  TaskListQuery,
  TaskSortOption,
} from "@/features/tasks/utils/task-filters";
import { PRIORITY_LABELS, selectFieldClassName, TASK_PRIORITIES } from "@/features/tasks/utils/task-priority";
import { useUiStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/lib/utils";

type TasksViewMode = "list" | "dashboard";

const filterSelectClassName = `${selectFieldClassName} h-9 min-w-[140px]`;

const SORT_OPTIONS: Array<{ value: TaskSortOption; label: string }> = [
  { value: "due_date_asc", label: "Due date (earliest)" },
  { value: "due_date_desc", label: "Due date (latest)" },
  { value: "priority_asc", label: "Priority (P0 first)" },
  { value: "priority_desc", label: "Priority (P3 first)" },
  { value: "updated_desc", label: "Recently updated" },
  { value: "created_desc", label: "Newest created" },
  { value: "created_asc", label: "Oldest created" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
];

export function TasksWorkspace() {
  const [viewMode, setViewMode] = useState<TasksViewMode>("list");
  const [query, setQuery] = useState<TaskListQuery>(DEFAULT_TASK_LIST_QUERY);
  const mode = useUiStore((state) => state.mode);
  const { data, isLoading, isError } = useTasks();
  const { data: projects } = useProjects();

  const visibleTasks = useMemo(() => {
    const scoped = applyModeFilter(data ?? [], mode);
    return applyTaskListQuery(scoped, query);
  }, [data, mode, query]);

  const stats = useMemo(() => {
    const scoped = applyModeFilter(data ?? [], mode);
    return {
      completed: scoped.filter((task) => task.isCompleted).length,
      total: scoped.length,
      showing: visibleTasks.length,
    };
  }, [data, mode, visibleTasks.length]);

  const updateQuery = <K extends keyof TaskListQuery>(key: K, value: TaskListQuery[K]) => {
    setQuery((current) => ({ ...current, [key]: value }));
  };

  const hasActiveFilters =
    query.priority !== "all" ||
    query.status !== "all" ||
    query.context !== "all" ||
    query.due !== "all" ||
    query.projectId !== "all" ||
    query.search.trim().length > 0;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Unable to load tasks right now.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">All tasks</h1>
          <p className="text-sm text-muted-foreground">
            Showing {stats.showing} of {stats.total} · {stats.completed} completed
          </p>
        </div>

        <div className="flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "list" ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <List className="size-4" />
            List
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "dashboard" ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setViewMode("dashboard")}
            aria-pressed={viewMode === "dashboard"}
          >
            <LayoutGrid className="size-4" />
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-border bg-surface p-1">
          {(["all", "completed"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-sm capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                query.completion === option ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
              )}
              onClick={() => updateQuery("completion", option)}
              aria-pressed={query.completion === option}
            >
              {option}
            </button>
          ))}
        </div>

        <label htmlFor="tasks-search" className="sr-only">
          Search tasks
        </label>
        <Input
          id="tasks-search"
          value={query.search}
          onChange={(event) => updateQuery("search", event.target.value)}
          placeholder="Search title or description..."
          className="h-9 max-w-xs"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setQuery({ ...DEFAULT_TASK_LIST_QUERY, completion: query.completion, sort: query.sort })}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FilterField label="Priority" htmlFor="filter-priority">
          <select
            id="filter-priority"
            className={filterSelectClassName}
            value={query.priority}
            onChange={(event) => updateQuery("priority", event.target.value as TaskListQuery["priority"])}
          >
            <option value="all">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Status" htmlFor="filter-status">
          <select
            id="filter-status"
            className={filterSelectClassName}
            value={query.status}
            onChange={(event) => updateQuery("status", event.target.value as TaskListQuery["status"])}
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </FilterField>

        <FilterField label="Context" htmlFor="filter-context">
          <select
            id="filter-context"
            className={filterSelectClassName}
            value={query.context}
            onChange={(event) => updateQuery("context", event.target.value as TaskListQuery["context"])}
          >
            <option value="all">All contexts</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>
        </FilterField>

        <FilterField label="Due date" htmlFor="filter-due">
          <select
            id="filter-due"
            className={filterSelectClassName}
            value={query.due}
            onChange={(event) => updateQuery("due", event.target.value as TaskListQuery["due"])}
          >
            <option value="all">All due dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="none">No due date</option>
          </select>
        </FilterField>

        <FilterField label="Project" htmlFor="filter-project">
          <select
            id="filter-project"
            className={filterSelectClassName}
            value={query.projectId}
            onChange={(event) => updateQuery("projectId", event.target.value)}
          >
            <option value="all">All projects</option>
            {(projects ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Sort by" htmlFor="filter-sort">
          <select
            id="filter-sort"
            className={filterSelectClassName}
            value={query.sort}
            onChange={(event) => updateQuery("sort", event.target.value as TaskSortOption)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
      </div>

      {viewMode === "list" ? <TaskTableView tasks={visibleTasks} /> : <TaskDashboardView tasks={visibleTasks} />}
    </div>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
