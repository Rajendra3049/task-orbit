"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { goalService } from "@/features/goals/services/goal.service";
import { CreateGoalInput, Goal } from "@/features/goals/types/goal.types";

const GOALS_QUERY_KEY = ["goals"] as const;

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => goalService.list(),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalInput) => goalService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      toast.success("Goal created");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to create goal"),
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, currentValue }: { goalId: string; currentValue: number }) =>
      goalService.updateProgress(goalId, currentValue),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      toast.success("Goal progress updated");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to update goal"),
  });
}
