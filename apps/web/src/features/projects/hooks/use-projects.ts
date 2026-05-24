"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectService } from "@/features/projects/services/project.service";
import { CreateProjectInput, Project } from "@/features/projects/types/project.types";

const PROJECTS_QUERY_KEY = ["projects"] as const;

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => projectService.list(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectInput) => projectService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project created");
    },
    onError: (error: Error) => toast.error(error.message || "Could not create project."),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: Partial<CreateProjectInput> & { status?: Project["status"]; progress?: number };
    }) => projectService.update(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project updated");
    },
    onError: (error: Error) => toast.error(error.message || "Could not update project."),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectService.remove(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete project."),
  });
}
