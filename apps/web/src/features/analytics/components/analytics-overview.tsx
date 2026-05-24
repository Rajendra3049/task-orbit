"use client";

import { Card } from "@/components/ui/card";
import { useGoals } from "@/features/goals/hooks/use-goals";
import { useHabits } from "@/features/habits/hooks/use-habits";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

export function AnalyticsOverview() {
  const mode = useUiStore((state) => state.mode);
  const { data: tasks } = useTasks();
  const { data: projects } = useProjects();
  const { data: habits } = useHabits();
  const { data: goals } = useGoals();

  const scopedTasks = applyModeFilter(tasks ?? [], mode);
  const completedTasks = scopedTasks.filter((task) => task.isCompleted).length;
  const pendingTasks = scopedTasks.length - completedTasks;
  const productivityScore = scopedTasks.length === 0 ? 0 : Math.round((completedTasks / scopedTasks.length) * 100);

  const scopedProjects = (projects ?? []).filter((project) => (mode === "office" ? project.context !== "personal" : true));
  const avgProjectProgress =
    scopedProjects.length === 0 ? 0 : Math.round(scopedProjects.reduce((acc, project) => acc + project.progress, 0) / scopedProjects.length);

  const scopedHabits = (habits ?? []).filter((habit) => (mode === "office" ? habit.context !== "personal" : true));
  const completedHabitsToday = scopedHabits.filter((habit) => habit.completedToday).length;
  const habitConsistency = scopedHabits.length === 0 ? 0 : Math.round((completedHabitsToday / scopedHabits.length) * 100);

  const scopedGoals = (goals ?? []).filter((goal) => (mode === "office" ? goal.context !== "personal" : true));
  const goalProgressScore =
    scopedGoals.length === 0
      ? 0
      : Math.round(
          scopedGoals.reduce((acc, goal) => acc + Math.min(100, (goal.currentValue / Math.max(1, goal.targetValue)) * 100), 0) /
            scopedGoals.length,
        );

  const lifeBalanceScore = Math.round((productivityScore + habitConsistency + goalProgressScore) / 3);

  const cards = [
    { label: "Productivity score", value: `${productivityScore}%`, hint: `${completedTasks} done · ${pendingTasks} pending` },
    { label: "Project health", value: `${avgProjectProgress}%`, hint: `${scopedProjects.length} active projects` },
    { label: "Habit consistency", value: `${habitConsistency}%`, hint: `${completedHabitsToday}/${scopedHabits.length} habits today` },
    { label: "Life balance", value: `${lifeBalanceScore}%`, hint: "Work + habits + goals" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Productivity trends, life-balance signal, and progress visibility for your current mode.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scores are computed from your current workspace data and can lag by a few seconds after updates.
        </p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
