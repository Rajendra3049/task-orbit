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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      toast.success("Habit created");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to create habit"),
  });
}

export function useToggleHabitToday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (habitId: string) => habitService.toggleToday(habitId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update habit"),
  });
}
