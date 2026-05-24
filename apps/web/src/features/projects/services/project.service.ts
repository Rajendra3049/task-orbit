"use client";

import { CreateProjectInput, Project } from "@/features/projects/types/project.types";
import { createSupabaseClient } from "@/services/supabase/client";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  context: Project["context"];
  status: Project["status"];
  progress: number;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    context: row.context,
    status: row.status,
    progress: row.progress,
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

export const projectService = {
  async list(): Promise<Project[]> {
    const { supabase } = await getClientAndUser();
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, context, status, progress, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: unknown) => mapRow(row as ProjectRow));
  },
  async create(payload: CreateProjectInput): Promise<Project> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: payload.name,
        description: payload.description || null,
        context: payload.context,
        status: "active",
        progress: 0,
      })
      .select("id, name, description, context, status, progress, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as ProjectRow);
  },
};
