"use client";

import { format } from "date-fns";
import { useState } from "react";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteTask, useToggleTaskCompletion, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
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
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");

  const handleDelete = () => {
    const shouldDelete = window.confirm("Delete this task? This action cannot be undone.");
    if (!shouldDelete) return;
    deleteTask.mutate(task.id);
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        {isEditing ? (
          <div className="w-full space-y-2">
            <label htmlFor={`edit-task-title-${task.id}`} className="sr-only">
              Task title
            </label>
            <Input id={`edit-task-title-${task.id}`} value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} />
            <label htmlFor={`edit-task-due-date-${task.id}`} className="sr-only">
              Due date
            </label>
            <Input
              id={`edit-task-due-date-${task.id}`}
              type="date"
              value={editedDueDate}
              onChange={(event) => setEditedDueDate(event.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{task.context}</p>
            <h3 className="text-base font-semibold">{task.title}</h3>
          </div>
        )}
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
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() =>
                  updateTask.mutate(
                    {
                      taskId: task.id,
                      payload: {
                        title: editedTitle.trim(),
                        dueDate: editedDueDate || undefined,
                      },
                    },
                    {
                      onSuccess: () => setIsEditing(false),
                    },
                  )
                }
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit task">
              <Pencil className="size-4" />
            </Button>
          )}
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
  );
}
