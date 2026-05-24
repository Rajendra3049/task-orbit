"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { TaskList } from "@/features/tasks/components/task-list";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter, applySearchFilter, filterByView } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

type TaskSectionsProps = {
  variant: "inbox" | "today" | "tasks";
};

export function TaskSections({ variant }: TaskSectionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const mode = useUiStore((state) => state.mode);
  const { data } = useTasks();

  const stats = useMemo(() => {
    const scoped = applyModeFilter(data ?? [], mode);
    return {
      inbox: filterByView(scoped, "inbox").length,
      overdue: filterByView(scoped, "overdue").length,
      today: filterByView(scoped, "today").length,
      upcoming: filterByView(scoped, "upcoming").length,
      completed: filterByView(scoped, "completed").length,
      search: applySearchFilter(scoped, searchQuery).length,
    };
  }, [data, mode, searchQuery]);

  return (
    <div className="space-y-4">
      <label htmlFor={`task-search-${variant}`} className="sr-only">
        Search tasks
      </label>
      <Input
        id={`task-search-${variant}`}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search by title, context, or priority..."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Inbox" value={stats.inbox} />
        <StatCard label="Overdue" value={stats.overdue} />
        <StatCard label="Today" value={stats.today} />
        <StatCard label="Upcoming" value={stats.upcoming} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {variant === "inbox" ? (
        <>
          <TaskList heading="Inbox capture" view="inbox" searchQuery={searchQuery} />
          <TaskList heading="Overdue follow-up" view="overdue" searchQuery={searchQuery} />
        </>
      ) : null}

      {variant === "today" ? (
        <>
          <TaskList heading="Overdue tasks" view="overdue" searchQuery={searchQuery} />
          <TaskList heading="Today's focus list" view="today" searchQuery={searchQuery} />
          <TaskList heading="Upcoming tasks" view="upcoming" searchQuery={searchQuery} />
        </>
      ) : null}

      {variant === "tasks" ? (
        <>
          <TaskList heading="All tasks" view="all" searchQuery={searchQuery} />
          <TaskList heading="Completed tasks" view="completed" searchQuery={searchQuery} />
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
