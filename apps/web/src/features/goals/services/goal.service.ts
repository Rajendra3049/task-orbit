"use client";

import { CreateGoalInput, Goal } from "@/features/goals/types/goal.types";
import { createSupabaseClient } from "@/services/supabase/client";

type GoalRow = {
  id: string;
  title: string;
  description: string | null;
  context: Goal["context"];
  target_value: number;
  current_value: number;
  status: Goal["status"];
  created_at: string;
  updated_at: string;
};

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    context: row.context,
    targetValue: row.target_value,
    currentValue: row.current_value,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClientAndUser() {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Authentication is required.");
  return { supabase, userId: user.id };
}

export const goalService = {
  async list(): Promise<Goal[]> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("goals")
      .select("id, title, description, context, target_value, current_value, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: unknown) => mapGoal(row as GoalRow));
  },
  async create(payload: CreateGoalInput): Promise<Goal> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description || null,
        context: payload.context,
        target_value: payload.targetValue,
        current_value: 0,
        status: "active",
      })
      .select("id, title, description, context, target_value, current_value, status, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return mapGoal(data as GoalRow);
  },
  async updateProgress(goalId: string, currentValue: number): Promise<void> {
    const { supabase } = await getClientAndUser();
    const { error } = await supabase.from("goals").update({ current_value: currentValue }).eq("id", goalId);
    if (error) throw new Error(error.message);
  },
};
