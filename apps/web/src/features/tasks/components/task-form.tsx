"use client";

import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import {
  PRIORITY_LABELS,
  selectFieldClassName,
  TASK_PRIORITIES,
  textareaFieldClassName,
} from "@/features/tasks/utils/task-priority";
import {
  createTaskSchema,
  CreateTaskSchemaValues,
} from "@/features/tasks/validations/task.schema";
import { useUiStore } from "@/shared/store/ui-store";

type TaskFormVariant = "full" | "today-compact" | "collapsible";

type TaskFormProps = {
  variant?: TaskFormVariant;
};

export function TaskForm({ variant = "full" }: TaskFormProps) {
  const mode = useUiStore((state) => state.mode);
  const { data: projects } = useProjects();
  const createTask = useCreateTask();
  const [isOpen, setIsOpen] = useState(variant !== "collapsible");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const todayDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const form = useForm<CreateTaskSchemaValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "p2",
      context: mode === "office" ? "work" : "personal",
      dueDate: variant === "today-compact" ? todayDate : "",
      projectId: "",
      isRecurring: false,
      recurrencePattern: "weekly",
    },
  });

  const isRecurring = form.watch("isRecurring");
  const showAdvancedFields = variant === "full" || variant === "collapsible";
  const showDescription = variant !== "today-compact" || showMoreOptions;
  const showTodayAdvanced = variant === "today-compact" && showMoreOptions;

  useEffect(() => {
    form.setValue("context", mode === "office" ? "work" : "personal");
    if (variant === "today-compact") {
      form.setValue("dueDate", todayDate);
    }
  }, [form, mode, todayDate, variant]);

  const onSubmit = async (values: CreateTaskSchemaValues) => {
    await createTask.mutateAsync({
      ...values,
      description: values.description?.trim() || undefined,
      projectId: values.projectId || undefined,
      recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
    });
    form.reset({
      title: "",
      description: "",
      priority: values.priority,
      context: mode === "office" ? "work" : "personal",
      dueDate: variant === "today-compact" ? todayDate : "",
      projectId: "",
      isRecurring: false,
      recurrencePattern: "weekly",
    });
    if (variant === "today-compact") {
      setShowMoreOptions(false);
    }
  };

  const heading =
    variant === "today-compact" ? "Add task for today" : variant === "collapsible" ? "Create task" : "Quick Capture";

  if (!isOpen) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <Button variant="ghost" onClick={() => setIsOpen(true)}>
            + New task
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Keep this collapsed to focus on list review. Open when you want to add a new task.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{heading}</h2>
        {variant === "collapsible" ? (
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Collapse
          </Button>
        ) : null}
      </div>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="md:col-span-2">
          <label htmlFor={`task-title-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
            Task title
          </label>
          <Input
            id={`task-title-${variant}`}
            placeholder={mode === "office" ? "e.g., Prepare Q2 roadmap draft" : "e.g., Book dentist appointment"}
            aria-invalid={!!form.formState.errors.title}
            aria-describedby={
              form.formState.errors.title ? `task-title-error-${variant}` : `task-title-help-${variant}`
            }
            {...form.register("title")}
          />
          <p id={`task-title-help-${variant}`} className="mt-1 text-xs text-muted-foreground">
            Use a clear action phrase so it is easy to execute later.
          </p>
          {form.formState.errors.title ? (
            <p id={`task-title-error-${variant}`} className="mt-1 text-xs text-danger">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        {showDescription ? (
          <div className="md:col-span-2">
            <label htmlFor={`task-description-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              id={`task-description-${variant}`}
              className={textareaFieldClassName}
              placeholder="Optional details, links, or notes"
              {...form.register("description")}
            />
          </div>
        ) : null}

        <div>
          <label htmlFor={`task-due-date-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
            Due date
          </label>
          <Input id={`task-due-date-${variant}`} type="date" {...form.register("dueDate")} />
        </div>

        <div>
          <label htmlFor={`task-priority-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
            Priority
          </label>
          <select id={`task-priority-${variant}`} className={selectFieldClassName} {...form.register("priority")}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`task-context-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
            Context
          </label>
          <select id={`task-context-${variant}`} className={selectFieldClassName} {...form.register("context")}>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>
        </div>

        {showAdvancedFields ? (
          <>
            <div>
              <label htmlFor={`task-project-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
                Project
              </label>
              <select id={`task-project-${variant}`} className={selectFieldClassName} {...form.register("projectId")}>
                <option value="">No project</option>
                {(projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm">
              <input id={`task-is-recurring-${variant}`} type="checkbox" {...form.register("isRecurring")} />
              <span>Recurring task</span>
            </label>

            {isRecurring ? (
              <div className="md:col-span-2">
                <label
                  htmlFor={`task-recurrence-pattern-${variant}`}
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Recurrence pattern
                </label>
                <select
                  id={`task-recurrence-pattern-${variant}`}
                  className={selectFieldClassName}
                  {...form.register("recurrencePattern")}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            ) : null}
          </>
        ) : null}

        {showTodayAdvanced ? (
          <>
            <div>
              <label htmlFor={`task-project-${variant}`} className="mb-1 block text-xs font-medium text-muted-foreground">
                Project
              </label>
              <select id={`task-project-${variant}`} className={selectFieldClassName} {...form.register("projectId")}>
                <option value="">No project</option>
                {(projects ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm">
              <input id={`task-is-recurring-${variant}`} type="checkbox" {...form.register("isRecurring")} />
              <span>Recurring task</span>
            </label>

            {isRecurring ? (
              <div className="md:col-span-2">
                <label
                  htmlFor={`task-recurrence-pattern-${variant}`}
                  className="mb-1 block text-xs font-medium text-muted-foreground"
                >
                  Recurrence pattern
                </label>
                <select
                  id={`task-recurrence-pattern-${variant}`}
                  className={selectFieldClassName}
                  {...form.register("recurrencePattern")}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            ) : null}
          </>
        ) : null}

        {variant === "today-compact" ? (
          <div className="md:col-span-2">
            <button
              type="button"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowMoreOptions((current) => !current)}
              aria-expanded={showMoreOptions}
            >
              {showMoreOptions ? "Hide options" : "More options (description, project, recurring)"}
            </button>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
