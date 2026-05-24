"use client";

import { CreateTaskInput, Task } from "@/features/tasks/types/task.types";
import { createSupabaseClient } from "@/services/supabase/client";

type TaskRow = {
  id: string;
  title: string;
  status: Task["status"];
  priority: Task["priority"];
  context: Task["context"];
  due_date: string | null;
  estimated_minutes: number;
  project_id: string | null;
  is_recurring: boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly" | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    context: row.context,
    dueDate: row.due_date,
    estimatedMinutes: row.estimated_minutes,
    projectId: row.project_id,
    isRecurring: row.is_recurring,
    recurrencePattern: row.recurrence_pattern,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getSupabaseUserId() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication is required.");
  }

  return { supabase, userId: user.id };
}

export const taskService = {
  async list(): Promise<Task[]> {
    const { supabase } = await getSupabaseUserId();
    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, title, status, priority, context, due_date, estimated_minutes, project_id, is_recurring, recurrence_pattern, is_completed, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: unknown) => mapTaskRow(row as TaskRow));
  },
  async create(payload: CreateTaskInput): Promise<Task> {
    const { supabase, userId } = await getSupabaseUserId();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: payload.title,
        status: "todo",
        priority: payload.priority,
        context: payload.context,
        due_date: payload.dueDate || null,
        estimated_minutes: payload.estimatedMinutes,
        project_id: payload.projectId || null,
        is_recurring: payload.isRecurring ?? false,
        recurrence_pattern: payload.isRecurring ? payload.recurrencePattern || "weekly" : null,
        is_completed: false,
      })
      .select(
        "id, title, status, priority, context, due_date, estimated_minutes, project_id, is_recurring, recurrence_pattern, is_completed, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapTaskRow(data as TaskRow);
  },
  async toggleComplete(taskId: string): Promise<void> {
    const { supabase } = await getSupabaseUserId();

    const { data: currentTask, error: currentTaskError } = await supabase
      .from("tasks")
      .select("id, is_completed")
      .eq("id", taskId)
      .single();

    if (currentTaskError || !currentTask) {
      throw new Error(currentTaskError?.message || "Task not found.");
    }

    const nextCompleted = !currentTask.is_completed;
    const { error } = await supabase
      .from("tasks")
      .update({
        is_completed: nextCompleted,
        status: nextCompleted ? "done" : "todo",
      })
      .eq("id", taskId);

    if (error) {
      throw new Error(error.message);
    }
  },
  async remove(taskId: string): Promise<void> {
    const { supabase } = await getSupabaseUserId();
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      throw new Error(error.message);
    }
  },
  async update(taskId: string, payload: Partial<CreateTaskInput>): Promise<Task> {
    const { supabase } = await getSupabaseUserId();
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: payload.title,
        priority: payload.priority,
        context: payload.context,
        due_date: payload.dueDate,
        estimated_minutes: payload.estimatedMinutes,
        project_id: payload.projectId,
        is_recurring: payload.isRecurring,
        recurrence_pattern: payload.isRecurring ? payload.recurrencePattern : null,
      })
      .eq("id", taskId)
      .select(
        "id, title, status, priority, context, due_date, estimated_minutes, project_id, is_recurring, recurrence_pattern, is_completed, created_at, updated_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapTaskRow(data as TaskRow);
  },
};
