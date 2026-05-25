"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter, filterByView } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

export function CalendarAgenda() {
  const { data, isLoading, isError } = useTasks();
  const mode = useUiStore((state) => state.mode);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading agenda...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-sm text-danger">Unable to load calendar agenda.</p>
      </Card>
    );
  }

  const scoped = applyModeFilter(data ?? [], mode);
  const overdue = filterByView(scoped, "overdue");
  const today = filterByView(scoped, "today");
  const upcoming = filterByView(scoped, "upcoming").slice(0, 10);

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-semibold">Calendar agenda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Weekly planner with overdue, today, and upcoming items.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">All due dates are shown in your local timezone.</p>
      </Card>

      <AgendaGroup title="Overdue" items={overdue} />
      <AgendaGroup title="Today" items={today} />
      <AgendaGroup title="Upcoming" items={upcoming} />
    </div>
  );
}

function AgendaGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; dueDate: string | null; priority: string }>;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">No items.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-surface-elevated p-3">
          <p className="font-medium">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.dueDate ? format(new Date(item.dueDate), "EEE, MMM d") : "No due date"} · {item.priority}
          </p>
        </div>
      ))}
    </Card>
  );
}
