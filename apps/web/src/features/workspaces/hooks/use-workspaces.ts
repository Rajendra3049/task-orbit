"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workspaceService } from "@/features/workspaces/services/workspace.service";
import { CreateWorkspaceInput, Workspace } from "@/features/workspaces/types/workspace.types";

const WORKSPACES_QUERY_KEY = ["workspaces"] as const;

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: WORKSPACES_QUERY_KEY,
    queryFn: () => workspaceService.list(),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkspaceInput) => workspaceService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORKSPACES_QUERY_KEY });
      toast.success("Workspace created");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to create workspace"),
  });
}
