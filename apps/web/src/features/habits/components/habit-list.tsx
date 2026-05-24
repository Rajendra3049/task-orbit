"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHabits, useToggleHabitToday } from "@/features/habits/hooks/use-habits";
import { useUiStore } from "@/shared/store/ui-store";

export function HabitList() {
  const { data, isLoading, isError } = useHabits();
  const toggleHabit = useToggleHabitToday();
  const mode = useUiStore((state) => state.mode);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading habits...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-sm text-danger">Unable to load habits.</p>
      </Card>
    );
  }

  const habits = (data ?? []).filter((habit) => (mode === "office" ? habit.context !== "personal" : true));
  if (habits.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No habits yet. Add one to build consistency.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {habits.map((habit) => (
        <Card key={habit.id} className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{habit.context}</p>
              <h3 className="text-lg font-semibold">{habit.name}</h3>
            </div>
            <span className="text-xs text-muted-foreground">{habit.frequency}</span>
          </div>
          <p className="text-sm text-muted-foreground">Streak: {habit.streakCount} days</p>
          <Button variant="ghost" onClick={() => toggleHabit.mutate(habit.id)}>
            {habit.completedToday ? (
              <>
                <CheckCircle2 className="mr-2 size-4 text-success" />
                Completed today
              </>
            ) : (
              <>
                <Circle className="mr-2 size-4 text-muted-foreground" />
                Mark as done today
              </>
            )}
          </Button>
        </Card>
      ))}
    </div>
  );
}
