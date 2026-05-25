"use client";

import { format } from "date-fns";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { TaskEditDialog } from "@/features/tasks/components/task-edit-dialog";
import { useDeleteTask, useToggleTaskCompletion } from "@/features/tasks/hooks/use-tasks";
import { Task } from "@/features/tasks/types/task.types";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const toggleTask = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    const shouldDelete = window.confirm("Delete this task? This action cannot be undone.");
    if (!shouldDelete) return;
    deleteTask.mutate(task.id);
  };

  return (
    <>
      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{task.context}</p>
            <h3 className={`text-base font-semibold ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h3>
            {task.description ? <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p> : null}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Due {task.dueDate ? format(new Date(task.dueDate), "EEE, MMM d") : "No due date"}
            {task.isRecurring ? ` · recurring ${task.recurrencePattern}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)} aria-label="Edit task">
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTask.mutate(task.id)}
              aria-label={task.isCompleted ? "Mark task as pending" : "Mark task as complete"}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete this task permanently"
              onClick={handleDelete}
              aria-label="Delete task"
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        </div>
      </Card>

      <TaskEditDialog task={isEditOpen ? task : null} onClose={() => setIsEditOpen(false)} />
    </>
  );
}
