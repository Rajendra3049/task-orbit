"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { TaskCard } from "@/features/tasks/components/task-card";
import { applyModeFilter, applySearchFilter, filterByView, TaskView } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

type TaskListProps = {
  heading?: string;
  view?: TaskView;
  searchQuery?: string;
};

export function TaskList({ heading = "Task list", view = "all", searchQuery = "" }: TaskListProps) {
  const { data, isLoading, isError } = useTasks();
  const { data: projects } = useProjects();
  const mode = useUiStore((state) => state.mode);

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    (projects ?? []).forEach((project) => map.set(project.id, project.name));
    return map;
  }, [projects]);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-sm text-danger">Unable to load tasks right now.</p>
      </Card>
    );
  }

  const visibleTasks = applySearchFilter(filterByView(applyModeFilter(data ?? [], mode), view), searchQuery);

  if (visibleTasks.length === 0) {
    const emptyMessage =
      view === "overdue"
        ? "No overdue tasks. Great consistency."
        : view === "today"
          ? "You are all clear today. Create a focus task to stay productive."
          : view === "completed"
            ? "No completed tasks yet. Finish one task to start momentum."
            : view === "inbox"
              ? "Inbox is empty. Capture ideas quickly to process later."
              : "No tasks found for this view.";
    return (
      <Card className="space-y-3">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        <div className="flex gap-2">
          <Link href="/inbox" className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-elevated">
            Go to inbox
          </Link>
          <Link href="/tasks" className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-elevated">
            View all tasks
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{visibleTasks.length}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectName={task.projectId ? projectNameById.get(task.projectId) : null}
          />
        ))}
      </div>
    </section>
  );
}
