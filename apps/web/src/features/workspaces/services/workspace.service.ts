"use client";

import { CreateWorkspaceInput, Workspace } from "@/features/workspaces/types/workspace.types";
import { createSupabaseClient } from "@/services/supabase/client";

type WorkspaceRow = {
  id: string;
  name: string;
  visibility: Workspace["visibility"];
  created_at: string;
  updated_at: string;
};

function mapWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    visibility: row.visibility,
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

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, visibility, created_at, updated_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: unknown) => mapWorkspace(row as WorkspaceRow));
  },
  async create(payload: CreateWorkspaceInput): Promise<Workspace> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("workspaces")
      .insert({
        owner_id: userId,
        name: payload.name,
        visibility: payload.visibility,
      })
      .select("id, name, visibility, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return mapWorkspace(data as WorkspaceRow);
  },
};
