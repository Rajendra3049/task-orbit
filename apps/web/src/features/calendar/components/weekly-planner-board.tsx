"use client";

import { eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { applyModeFilter } from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";

export function WeeklyPlannerBoard() {
  const { data, isLoading, isError } = useTasks();
  const updateTask = useUpdateTask();
  const mode = useUiStore((state) => state.mode);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading weekly planner...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-sm text-danger">Unable to load weekly planner.</p>
      </Card>
    );
  }

  const days = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const scoped = applyModeFilter(data ?? [], mode);
  const unscheduledTasks = scoped.filter((task) => !task.dueDate);

  const handleDrop = (taskId: string, dayIso: string | null) => {
    updateTask.mutate({
      taskId,
      payload: {
        dueDate: dayIso,
      },
    });
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Weekly planner board</h2>
      <div
        className="rounded-xl border border-dashed border-border bg-surface p-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const taskId = event.dataTransfer.getData("text/task-id");
          if (!taskId) return;
          handleDrop(taskId, null);
        }}
      >
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Unscheduled</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {unscheduledTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">Drop a task here to remove its due date.</p>
          ) : (
            unscheduledTasks.map((task) => (
              <DraggableTask key={task.id} taskId={task.id} title={task.title} />
            ))
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((day) => {
          const dayTasks = scoped.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), day));
          return (
            <div
              key={day.toISOString()}
              className="rounded-xl border border-border bg-surface-elevated p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/task-id");
                if (!taskId) return;
                handleDrop(taskId, day.toISOString());
              }}
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{format(day, "EEE d")}</p>
              <div className="mt-2 space-y-2">
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks</p>
                ) : (
                  dayTasks.map((task) => (
                    <DraggableTask key={task.id} taskId={task.id} title={task.title} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DraggableTask({ taskId, title }: { taskId: string; title: string }) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/task-id", taskId);
      }}
      className="cursor-grab rounded-lg border border-border bg-surface px-2 py-1 active:cursor-grabbing"
    >
      <p className="text-xs">{title}</p>
    </div>
  );
}
