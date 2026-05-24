"use client";

import { Card } from "@/components/ui/card";
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
  const mode = useUiStore((state) => state.mode);

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
      <Card>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
