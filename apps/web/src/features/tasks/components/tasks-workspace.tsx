"use client";

import { LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { TaskDashboardView } from "@/features/tasks/components/task-dashboard-view";
import { TaskTableView } from "@/features/tasks/components/task-table-view";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter, applySearchFilter } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/lib/utils";

type TasksViewMode = "list" | "dashboard";
type TasksFilter = "all" | "active" | "completed";

export function TasksWorkspace() {
  const [viewMode, setViewMode] = useState<TasksViewMode>("list");
  const [filter, setFilter] = useState<TasksFilter>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const mode = useUiStore((state) => state.mode);
  const { data, isLoading, isError } = useTasks();

  const visibleTasks = useMemo(() => {
    let scoped = applyModeFilter(data ?? [], mode);
    scoped = applySearchFilter(scoped, searchQuery);

    if (filter === "active") {
      return scoped.filter((task) => !task.isCompleted);
    }
    if (filter === "completed") {
      return scoped.filter((task) => task.isCompleted);
    }
    return scoped;
  }, [data, filter, mode, searchQuery]);

  const stats = useMemo(() => {
    const scoped = applyModeFilter(data ?? [], mode);
    return {
      active: scoped.filter((task) => !task.isCompleted).length,
      completed: scoped.filter((task) => task.isCompleted).length,
      total: scoped.length,
    };
  }, [data, mode]);

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
            {stats.active} active · {stats.completed} completed · {stats.total} total
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
        <label htmlFor="tasks-search" className="sr-only">
          Search tasks
        </label>
        <Input
          id="tasks-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title..."
          className="max-w-md"
        />

        <div className="flex rounded-xl border border-border bg-surface p-1">
          {(["active", "all", "completed"] as TasksFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-sm capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filter === option ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
              )}
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "list" ? <TaskTableView tasks={visibleTasks} /> : <TaskDashboardView tasks={visibleTasks} />}
    </div>
  );
}
