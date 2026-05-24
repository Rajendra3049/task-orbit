"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { habitService } from "@/features/habits/services/habit.service";
import { CreateHabitInput, Habit } from "@/features/habits/types/habit.types";

const HABITS_QUERY_KEY = ["habits"] as const;

export function useHabits() {
  return useQuery<Habit[]>({
    queryKey: HABITS_QUERY_KEY,
    queryFn: () => habitService.list(),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHabitInput) => habitService.create(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previous = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY) ?? [];
      const now = new Date().toISOString();
      const optimistic: Habit = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: payload.name,
        context: payload.context,
        frequency: payload.frequency,
        streakCount: 0,
        completedToday: false,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      toast.success("Habit created");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Unable to create habit");
    },
  });
}

export function useToggleHabitToday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (habitId: string) => habitService.toggleToday(habitId),
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previous = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Habit[]>(
        HABITS_QUERY_KEY,
        previous.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                completedToday: !habit.completedToday,
              }
            : habit,
        ),
      );
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onError: (error: Error, _habitId, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Unable to update habit");
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      habitId,
      payload,
    }: {
      habitId: string;
      payload: Partial<CreateHabitInput> & { streakCount?: number };
    }) => habitService.update(habitId, payload),
    onMutate: async ({ habitId, payload }) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previous = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Habit[]>(
        HABITS_QUERY_KEY,
        previous.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                name: payload.name ?? habit.name,
                context: payload.context ?? habit.context,
                frequency: payload.frequency ?? habit.frequency,
                streakCount: payload.streakCount ?? habit.streakCount,
              }
            : habit,
        ),
      );
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      toast.success("Habit updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Unable to update habit");
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (habitId: string) => habitService.remove(habitId),
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEY });
      const previous = queryClient.getQueryData<Habit[]>(HABITS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Habit[]>(
        HABITS_QUERY_KEY,
        previous.filter((habit) => habit.id !== habitId),
      );
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      toast.success("Habit deleted");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onError: (error: Error, _habitId, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Habit[]>(HABITS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Unable to delete habit");
    },
  });
}
