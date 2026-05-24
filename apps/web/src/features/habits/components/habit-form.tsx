"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateHabit } from "@/features/habits/hooks/use-habits";

export function HabitForm() {
  const createHabit = useCreateHabit();
  const [name, setName] = useState("");
  const [context, setContext] = useState<"work" | "personal" | "general">("personal");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createHabit.mutateAsync({ name: name.trim(), context, frequency });
    setName("");
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Create habit</h2>
      <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
        <Input
          className="md:col-span-3"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g., 30 min deep work"
          required
        />
        <select
          className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
          value={context}
          onChange={(event) => setContext(event.target.value as "work" | "personal" | "general")}
        >
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="general">General</option>
        </select>
        <select
          className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as "daily" | "weekly")}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <Button type="submit" disabled={createHabit.isPending}>
          {createHabit.isPending ? "Creating..." : "Create habit"}
        </Button>
        <p className="md:col-span-3 text-xs text-muted-foreground">
          Daily habits are best for routines. Weekly habits are best for planning and reviews.
        </p>
      </form>
    </Card>
  );
}
