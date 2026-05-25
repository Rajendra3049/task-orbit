"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskService } from "@/features/tasks/services/task.service";
import { CreateTaskInput, Task } from "@/features/tasks/types/task.types";
import { createSupabaseClient } from "@/services/supabase/client";

const TASKS_QUERY_KEY = ["tasks"] as const;

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => taskService.list(),
  });
}

export function useTasksRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("taskorbit:tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskInput) => taskService.create(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
      const now = new Date().toISOString();
      const optimisticTask: Task = {
        id: `optimistic-${crypto.randomUUID()}`,
        title: payload.title,
        description: payload.description?.trim() || null,
        status: payload.status ?? "todo",
        priority: payload.priority,
        context: payload.context,
        dueDate: payload.dueDate ?? null,
        projectId: payload.projectId ?? null,
        isRecurring: payload.isRecurring ?? false,
        recurrencePattern: payload.recurrencePattern ?? null,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, [optimisticTask, ...previousTasks]);
      return { previousTasks };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task created");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, context.previousTasks);
      }
      toast.error(error.message || "Could not create the task.");
    },
  });
}

export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.toggleComplete(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Task[]>(
        TASKS_QUERY_KEY,
        previousTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isCompleted: !task.isCompleted,
                status: task.isCompleted ? "todo" : "done",
              }
            : task,
        ),
      );
      return { previousTasks };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, context.previousTasks);
      }
      toast.error(error.message || "Could not update task status.");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.remove(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Task[]>(
        TASKS_QUERY_KEY,
        previousTasks.filter((task) => task.id !== taskId),
      );
      return { previousTasks };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task deleted");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, context.previousTasks);
      }
      toast.error(error.message || "Could not delete task.");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Partial<CreateTaskInput>;
    }) => taskService.update(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Task[]>(
        TASKS_QUERY_KEY,
        previousTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: payload.title ?? task.title,
                description: payload.description === undefined ? task.description : payload.description?.trim() || null,
                priority: payload.priority ?? task.priority,
                context: payload.context ?? task.context,
                status: payload.status ?? task.status,
                dueDate: payload.dueDate === undefined ? task.dueDate : payload.dueDate,
                projectId: payload.projectId === undefined ? task.projectId : payload.projectId ?? null,
                isRecurring: payload.isRecurring ?? task.isRecurring,
                recurrencePattern: payload.recurrencePattern ?? task.recurrencePattern,
                isCompleted: payload.status ? payload.status === "done" : task.isCompleted,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
      return { previousTasks };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error, _args, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, context.previousTasks);
      }
      toast.error(error.message || "Could not update task.");
    },
  });
}
