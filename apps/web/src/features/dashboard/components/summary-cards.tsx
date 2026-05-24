"use client";

import { Card } from "@/components/ui/card";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter, filterByView } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

export function SummaryCards() {
  const { data } = useTasks();
  const mode = useUiStore((state) => state.mode);
  const tasks = applyModeFilter(data ?? [], mode);
  const completed = tasks.filter((task) => task.isCompleted).length;
  const dueToday = filterByView(tasks, "today").filter((task) => !task.isCompleted).length;
  const overdue = filterByView(tasks, "overdue").length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const cards = [
    { label: "Tasks due today", value: dueToday.toString() },
    { label: "Overdue tasks", value: overdue.toString() },
    { label: "Weekly progress", value: `${completionRate}%` },
    { label: "Streak", value: `${Math.min(14, completed + 1)} days` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
          <p className="text-2xl font-semibold">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
