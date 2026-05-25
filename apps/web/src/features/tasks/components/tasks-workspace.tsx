"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { TaskDashboardView } from "@/features/tasks/components/task-dashboard-view";
import { TaskFiltersBar } from "@/features/tasks/components/task-filters-bar";
import { TaskTableView } from "@/features/tasks/components/task-table-view";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import {
  applyModeFilter,
  applyTaskListQuery,
  DEFAULT_TASK_LIST_QUERY,
  TaskListQuery,
} from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/lib/utils";

type TasksViewMode = "list" | "dashboard";

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

      <TaskFiltersBar
        query={query}
        onQueryChange={setQuery}
        projects={projects ?? []}
        idPrefix="tasks"
        showCompletionTabs
        showDueFilter
      />

      {viewMode === "list" ? <TaskTableView tasks={visibleTasks} /> : <TaskDashboardView tasks={visibleTasks} />}
    </div>
  );
}
