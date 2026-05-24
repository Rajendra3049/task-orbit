"use client";

import { createSupabaseClient } from "@/services/supabase/client";
import { WorkspaceMode } from "@/shared/store/ui-store";

type SettingsRow = {
  user_id: string;
  mode: WorkspaceMode;
};

async function getClientAndUser() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You need to sign in first.");
  }

  return { supabase, userId: user.id };
}

export const settingsService = {
  async getMode(): Promise<WorkspaceMode> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("settings")
      .select("user_id, mode")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return "personal";
    }

    return (data as SettingsRow).mode ?? "personal";
  },

  async setMode(mode: WorkspaceMode): Promise<WorkspaceMode> {
    const { supabase, userId } = await getClientAndUser();
    const { data, error } = await supabase
      .from("settings")
      .upsert({ user_id: userId, mode }, { onConflict: "user_id" })
      .select("mode")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return ((data as { mode: WorkspaceMode } | null)?.mode ?? mode) as WorkspaceMode;
  },
};
