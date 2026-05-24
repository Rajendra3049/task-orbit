"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import {
  createTaskSchema,
  CreateTaskSchemaValues,
} from "@/features/tasks/validations/task.schema";
import { useUiStore } from "@/shared/store/ui-store";

export function TaskForm() {
  const mode = useUiStore((state) => state.mode);
  const { data: projects } = useProjects();
  const createTask = useCreateTask();
  const form = useForm<CreateTaskSchemaValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      context: mode === "office" ? "work" : "personal",
      estimatedMinutes: 30,
      dueDate: "",
      projectId: "",
      isRecurring: false,
      recurrencePattern: "weekly",
    },
  });

  useEffect(() => {
    form.setValue("context", mode === "office" ? "work" : "personal");
  }, [form, mode]);

  const onSubmit = async (values: CreateTaskSchemaValues) => {
    await createTask.mutateAsync({
      ...values,
      projectId: values.projectId || undefined,
    });
    form.reset();
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Capture</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="md:col-span-2">
          <Input
            placeholder={mode === "office" ? "e.g., Prepare Q2 roadmap draft" : "e.g., Book dentist appointment"}
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="mt-1 text-xs text-danger">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div title="Set a due date in your local timezone">
          <Input type="date" {...form.register("dueDate")} />
        </div>
        <div>
          <Input
            type="number"
            min={5}
            max={480}
            title="Estimated effort in minutes (5-480)"
            {...form.register("estimatedMinutes", { valueAsNumber: true })}
          />
        </div>

        <div title="Optional: link this task to a project">
          <select
            className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
            {...form.register("projectId")}
          >
            <option value="">No project</option>
            {(projects ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
            {...form.register("priority")}
          >
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>
        <div>
          <select
            className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
            {...form.register("context")}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>
        </div>

        <label className="flex items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm">
          <input type="checkbox" title="When complete, the next occurrence is auto-created" {...form.register("isRecurring")} />
          Recurring task
        </label>
        <div>
          <select
            className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
            {...form.register("recurrencePattern")}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <p className="md:col-span-2 text-xs text-muted-foreground">
          Tip: Use recurring tasks for routines like weekly planning, billing reviews, or workouts.
        </p>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
