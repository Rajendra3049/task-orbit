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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task created");
    },
    onError: (error: Error) => toast.error(error.message || "Could not create the task."),
  });
}

export function useToggleTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.toggleComplete(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (error: Error) => toast.error(error.message || "Could not update task status."),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.remove(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete task."),
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast.success("Task updated");
    },
    onError: (error: Error) => toast.error(error.message || "Could not update task."),
  });
}
