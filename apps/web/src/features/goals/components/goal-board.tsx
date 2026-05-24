"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateGoal, useGoals, useUpdateGoalProgress } from "@/features/goals/hooks/use-goals";
import { useUiStore } from "@/shared/store/ui-store";

export function GoalBoard() {
  const { data, isLoading, isError } = useGoals();
  const createGoal = useCreateGoal();
  const updateProgress = useUpdateGoalProgress();
  const mode = useUiStore((state) => state.mode);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(10);
  const [context, setContext] = useState<"work" | "personal" | "general">("work");

  const goals = (data ?? []).filter((goal) => (mode === "office" ? goal.context !== "personal" : true));

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Create goal</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="goal-title" className="mb-1 block text-xs font-medium text-muted-foreground">
              Goal title
            </label>
            <Input id="goal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Publish 12 articles" />
          </div>
          <div>
            <label htmlFor="goal-description" className="mb-1 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Input
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this goal matters"
            />
          </div>
          <div>
            <label htmlFor="goal-target" className="mb-1 block text-xs font-medium text-muted-foreground">
              Target value
            </label>
            <Input
              id="goal-target"
              type="number"
              min={1}
              title="Target value should be a measurable milestone"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value || 1))}
            />
          </div>
          <div>
            <label htmlFor="goal-context" className="mb-1 block text-xs font-medium text-muted-foreground">
              Context
            </label>
            <select
              id="goal-context"
              className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
              value={context}
              onChange={(e) => setContext(e.target.value as "work" | "personal" | "general")}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="general">General</option>
            </select>
          </div>
          <Button
            className="md:col-span-2"
            onClick={() =>
              createGoal.mutate({
                title: title.trim(),
                description: description.trim(),
                targetValue: target,
                context,
              })
            }
            disabled={!title.trim()}
          >
            Create goal
          </Button>
        </div>
      </Card>

      {isLoading ? <Card>Loading goals...</Card> : null}
      {isError ? <Card className="text-danger">Unable to load goals.</Card> : null}
      {!isLoading && !isError && goals.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No goals yet. Start with one measurable target for this week.
          </p>
        </Card>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = goal.targetValue === 0 ? 0 : Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          return (
            <Card key={goal.id} className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{goal.context}</p>
              <h3 className="text-lg font-semibold">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">{goal.description || "No description"}</p>
              <p className="text-sm text-muted-foreground">
                Progress: {goal.currentValue}/{goal.targetValue} ({progress}%)
              </p>
              <div className="h-2 rounded-full bg-surface-elevated">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <Button
                variant="ghost"
                title="Increment progress by one completed unit"
                onClick={() => updateProgress.mutate({ goalId: goal.id, currentValue: goal.currentValue + 1 })}
              >
                +1 progress
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
