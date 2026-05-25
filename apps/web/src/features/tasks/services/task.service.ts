"use client";

import { addDays, addMonths, addWeeks } from "date-fns";
import { CreateTaskInput, Task } from "@/features/tasks/types/task.types";
import { normalizePriority } from "@/features/tasks/utils/task-priority";
import { createSupabaseClient } from "@/services/supabase/client";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: string;
  context: Task["context"];
  due_date: string | null;
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
    description: row.description,
    status: row.status,
    priority: normalizePriority(row.priority),
    context: row.context,
    dueDate: row.due_date,
    projectId: row.project_id,
    isRecurring: row.is_recurring,
    recurrencePattern: row.recurrence_pattern,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TASK_SELECT =
  "id, title, description, status, priority, context, due_date, project_id, is_recurring, recurrence_pattern, is_completed, created_at, updated_at";

function getNextRecurringDueDate(
  dueDate: string | null,
  recurrencePattern: "daily" | "weekly" | "monthly" | null,
) {
  const baseDate = dueDate ? new Date(dueDate) : new Date();
  switch (recurrencePattern) {
    case "daily":
      return addDays(baseDate, 1).toISOString();
    case "weekly":
      return addWeeks(baseDate, 1).toISOString();
    case "monthly":
      return addMonths(baseDate, 1).toISOString();
    default:
      return null;
  }
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
    const { data, error } = await supabase.from("tasks").select(TASK_SELECT).order("created_at", { ascending: false });

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
        description: payload.description?.trim() || null,
        status: payload.status ?? "todo",
        priority: payload.priority,
        context: payload.context,
        due_date: payload.dueDate || null,
        estimated_minutes: 30,
        project_id: payload.projectId || null,
        is_recurring: payload.isRecurring ?? false,
        recurrence_pattern: payload.isRecurring ? payload.recurrencePattern || "weekly" : null,
        is_completed: false,
      })
      .select(TASK_SELECT)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapTaskRow(data as TaskRow);
  },
  async toggleComplete(taskId: string): Promise<void> {
    const { supabase, userId } = await getSupabaseUserId();

    const { data: currentTask, error: currentTaskError } = await supabase
      .from("tasks")
      .select(
        "id, title, description, is_completed, status, priority, context, due_date, project_id, is_recurring, recurrence_pattern",
      )
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

    if (nextCompleted && currentTask.is_recurring) {
      const nextDueDate = getNextRecurringDueDate(currentTask.due_date, currentTask.recurrence_pattern);
      if (nextDueDate) {
        const { error: recurringCreateError } = await supabase.from("tasks").insert({
          user_id: userId,
          title: currentTask.title,
          description: currentTask.description,
          status: "todo",
          priority: normalizePriority(currentTask.priority),
          context: currentTask.context,
          due_date: nextDueDate,
          estimated_minutes: 30,
          project_id: currentTask.project_id,
          is_recurring: true,
          recurrence_pattern: currentTask.recurrence_pattern,
        });
        if (recurringCreateError) {
          throw new Error(recurringCreateError.message);
        }
      }
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
    const updatePayload: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "title")) {
      updatePayload.title = payload.title;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "description")) {
      updatePayload.description = payload.description?.trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "priority")) {
      updatePayload.priority = payload.priority;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "context")) {
      updatePayload.context = payload.context;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "dueDate")) {
      updatePayload.due_date = payload.dueDate;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "projectId")) {
      updatePayload.project_id = payload.projectId || null;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "status")) {
      updatePayload.status = payload.status;
      updatePayload.is_completed = payload.status === "done";
    }
    if (Object.prototype.hasOwnProperty.call(payload, "isRecurring")) {
      updatePayload.is_recurring = payload.isRecurring;
      updatePayload.recurrence_pattern = payload.isRecurring ? payload.recurrencePattern || "weekly" : null;
    } else if (Object.prototype.hasOwnProperty.call(payload, "recurrencePattern")) {
      updatePayload.recurrence_pattern = payload.recurrencePattern;
    }

    const { data, error } = await supabase.from("tasks").update(updatePayload).eq("id", taskId).select(TASK_SELECT).single();

    if (error) {
      throw new Error(error.message);
    }

    return mapTaskRow(data as TaskRow);
  },
};
