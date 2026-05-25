"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useDeleteTask, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { Task } from "@/features/tasks/types/task.types";
import {
  PRIORITY_LABELS,
  selectFieldClassName,
  TASK_PRIORITIES,
  textareaFieldClassName,
} from "@/features/tasks/utils/task-priority";
import { updateTaskSchema, UpdateTaskSchemaValues } from "@/features/tasks/validations/task.schema";

type TaskEditDialogProps = {
  task: Task | null;
  onClose: () => void;
};

export function TaskEditDialog({ task, onClose }: TaskEditDialogProps) {
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const form = useForm<UpdateTaskSchemaValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "p2",
      context: "general",
      dueDate: "",
      projectId: "",
      status: "todo",
      isRecurring: false,
      recurrencePattern: "weekly",
    },
  });

  const isRecurring = form.watch("isRecurring");
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (!task) return;
    form.reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      context: task.context,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      projectId: task.projectId ?? "",
      status: task.status,
      isRecurring: task.isRecurring,
      recurrencePattern: task.recurrencePattern ?? "weekly",
    });
  }, [form, task]);

  if (!task) {
    return null;
  }

  const onSubmit = async (values: UpdateTaskSchemaValues) => {
    await updateTask.mutateAsync({
      taskId: task.id,
      payload: {
        title: values.title,
        description: values.description,
        priority: values.priority,
        context: values.context,
        dueDate: values.dueDate || null,
        projectId: values.projectId || undefined,
        status: values.status,
        isRecurring: values.isRecurring,
        recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
      },
    });
    onClose();
  };

  const handleDelete = () => {
    const shouldDelete = window.confirm("Delete this task? This action cannot be undone.");
    if (!shouldDelete) return;
    deleteTask.mutate(task.id, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-edit-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border bg-background-secondary p-5 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="task-edit-title" className="text-lg font-semibold">
            Edit task
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close edit dialog">
            <X className="size-4" />
          </Button>
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <label htmlFor="edit-task-title" className="mb-1 block text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input id="edit-task-title" {...form.register("title")} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-task-description" className="mb-1 block text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              id="edit-task-description"
              className={textareaFieldClassName}
              placeholder="Add context, links, or acceptance criteria"
              {...form.register("description")}
            />
          </div>

          <div>
            <label htmlFor="edit-task-priority" className="mb-1 block text-xs font-medium text-muted-foreground">
              Priority
            </label>
            <select id="edit-task-priority" className={selectFieldClassName} {...form.register("priority")}>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-task-status" className="mb-1 block text-xs font-medium text-muted-foreground">
              Status
            </label>
            <select id="edit-task-status" className={selectFieldClassName} {...form.register("status")}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-task-due-date" className="mb-1 block text-xs font-medium text-muted-foreground">
              Due date
            </label>
            <Input id="edit-task-due-date" type="date" {...form.register("dueDate")} />
          </div>

          <div>
            <label htmlFor="edit-task-context" className="mb-1 block text-xs font-medium text-muted-foreground">
              Context
            </label>
            <select id="edit-task-context" className={selectFieldClassName} {...form.register("context")}>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-task-project" className="mb-1 block text-xs font-medium text-muted-foreground">
              Project
            </label>
            <select id="edit-task-project" className={selectFieldClassName} {...form.register("projectId")}>
              <option value="">No project</option>
              {(projects ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm md:col-span-2">
            <input id="edit-task-recurring" type="checkbox" {...form.register("isRecurring")} />
            <span>Recurring task</span>
          </label>

          {isRecurring ? (
            <div className="md:col-span-2">
              <label htmlFor="edit-task-recurrence" className="mb-1 block text-xs font-medium text-muted-foreground">
                Recurrence pattern
              </label>
              <select id="edit-task-recurrence" className={selectFieldClassName} {...form.register("recurrencePattern")}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" disabled={updateTask.isPending || !isDirty}>
              {updateTask.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="ghost" className="text-danger" onClick={handleDelete} disabled={deleteTask.isPending}>
              Delete task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
