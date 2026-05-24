"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteHabit, useHabits, useToggleHabitToday, useUpdateHabit } from "@/features/habits/hooks/use-habits";
import { useUiStore } from "@/shared/store/ui-store";

export function HabitList() {
  const { data, isLoading, isError } = useHabits();
  const toggleHabit = useToggleHabitToday();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const mode = useUiStore((state) => state.mode);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const handleDelete = (habitId: string) => {
    const shouldDelete = window.confirm("Delete this habit and its completion logs?");
    if (!shouldDelete) return;
    deleteHabit.mutate(habitId);
  };

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
              {editingHabitId === habit.id ? (
                <>
                  <label htmlFor={`edit-habit-name-${habit.id}`} className="sr-only">
                    Habit name
                  </label>
                  <Input
                    id={`edit-habit-name-${habit.id}`}
                    value={editedName}
                    onChange={(event) => setEditedName(event.target.value)}
                  />
                </>
              ) : (
                <h3 className="text-lg font-semibold">{habit.name}</h3>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{habit.frequency}</span>
          </div>
          <p className="text-sm text-muted-foreground">Streak: {habit.streakCount} days</p>
          <Button
            variant="ghost"
            title="Mark this habit as complete for today"
            onClick={() => toggleHabit.mutate(habit.id)}
          >
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
          {editingHabitId === habit.id ? (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  updateHabit.mutate(
                    { habitId: habit.id, payload: { name: editedName } },
                    { onSuccess: () => setEditingHabitId(null) },
                  )
                }
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditingHabitId(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                title="Edit habit name"
                onClick={() => {
                  setEditingHabitId(habit.id);
                  setEditedName(habit.name);
                }}
              >
                Edit habit
              </Button>
              <Button variant="ghost" title="Delete habit" onClick={() => handleDelete(habit.id)}>
                Delete
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
