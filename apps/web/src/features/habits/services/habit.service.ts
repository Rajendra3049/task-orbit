"use client";

import { formatISO, startOfDay } from "date-fns";
import { CreateHabitInput, Habit } from "@/features/habits/types/habit.types";
import { createSupabaseClient } from "@/services/supabase/client";

type HabitRow = {
  id: string;
  name: string;
  context: Habit["context"];
  frequency: Habit["frequency"];
  streak_count: number;
  created_at: string;
  updated_at: string;
};

type HabitLogRow = {
  habit_id: string;
  completed_on: string;
};

function mapHabit(row: HabitRow, completedHabitIds: Set<string>): Habit {
  return {
    id: row.id,
    name: row.name,
    context: row.context,
    frequency: row.frequency,
    streakCount: row.streak_count,
    completedToday: completedHabitIds.has(row.id),
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

export const habitService = {
  async list(): Promise<Habit[]> {
    const { supabase, userId } = await getClientAndUser();

    const [{ data: habits, error: habitsError }, { data: logs, error: logsError }] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, context, frequency, streak_count, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("habit_logs")
        .select("habit_id, completed_on")
        .eq("user_id", userId)
        .gte("completed_on", formatISO(startOfDay(new Date()))),
    ]);

    if (habitsError) throw new Error(habitsError.message);
    if (logsError) throw new Error(logsError.message);

    const completed = new Set((logs as HabitLogRow[] | null)?.map((log) => log.habit_id) ?? []);
    return (habits as HabitRow[] | null)?.map((habit) => mapHabit(habit, completed)) ?? [];
  },
  async create(payload: CreateHabitInput): Promise<Habit> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: payload.name,
        context: payload.context,
        frequency: payload.frequency,
        streak_count: 0,
      })
      .select("id, name, context, frequency, streak_count, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return mapHabit(data as HabitRow, new Set());
  },
  async toggleToday(habitId: string): Promise<void> {
    const { supabase, userId } = await getClientAndUser();
    const today = formatISO(startOfDay(new Date()), { representation: "date" });

    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("completed_on", today)
      .maybeSingle();

    if (existingLog) {
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", userId)
        .eq("completed_on", today);
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: userId,
      completed_on: today,
    });
    if (error) throw new Error(error.message);
  },
};
