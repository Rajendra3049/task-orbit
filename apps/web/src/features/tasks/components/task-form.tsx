"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import {
  createTaskSchema,
  CreateTaskSchemaValues,
} from "@/features/tasks/validations/task.schema";
import { useUiStore } from "@/shared/store/ui-store";

export function TaskForm() {
  const mode = useUiStore((state) => state.mode);
  const createTask = useCreateTask();
  const form = useForm<CreateTaskSchemaValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      priority: "medium",
      context: mode === "office" ? "work" : "personal",
      estimatedMinutes: 30,
      dueDate: "",
    },
  });

  useEffect(() => {
    form.setValue("context", mode === "office" ? "work" : "personal");
  }, [form, mode]);

  const onSubmit = async (values: CreateTaskSchemaValues) => {
    await createTask.mutateAsync(values);
    form.reset();
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Capture</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="md:col-span-2">
          <Input
            placeholder={mode === "office" ? "Capture a work task..." : "Capture a personal task..."}
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="mt-1 text-xs text-danger">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <Input type="date" {...form.register("dueDate")} />
        </div>
        <div>
          <Input
            type="number"
            min={5}
            max={480}
            {...form.register("estimatedMinutes", { valueAsNumber: true })}
          />
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

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
