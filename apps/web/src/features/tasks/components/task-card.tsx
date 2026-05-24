"use client";

import { format } from "date-fns";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeleteTask, useToggleTaskCompletion } from "@/features/tasks/hooks/use-tasks";
import { Task } from "@/features/tasks/types/task.types";

type TaskCardProps = {
  task: Task;
};

const priorityMap = {
  low: "neutral",
  medium: "warning",
  high: "danger",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  const toggleTask = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{task.context}</p>
          <h3 className="text-base font-semibold">{task.title}</h3>
        </div>
        <Badge variant={priorityMap[task.priority]}>{task.priority}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Due{" "}
          {task.dueDate
            ? format(new Date(task.dueDate), "EEE, MMM d")
            : "No due date"}{" "}
          · {task.estimatedMinutes}m {task.isRecurring ? `· recurring ${task.recurrencePattern}` : ""}
        </p>
        <div className="flex items-center gap-2">
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
          <Button variant="ghost" size="icon" onClick={() => deleteTask.mutate(task.id)} aria-label="Delete task">
            <Trash2 className="size-4 text-danger" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
