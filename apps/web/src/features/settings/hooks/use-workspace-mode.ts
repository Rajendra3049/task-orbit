"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "@/features/settings/services/settings.service";
import { WorkspaceMode } from "@/shared/store/ui-store";

const MODE_QUERY_KEY = ["settings", "mode"] as const;

export function useWorkspaceMode() {
  return useQuery({
    queryKey: MODE_QUERY_KEY,
    queryFn: () => settingsService.getMode(),
  });
}

export function useSaveWorkspaceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mode: WorkspaceMode) => settingsService.setMode(mode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MODE_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save mode.");
    },
  });
}
