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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Project[]>(PROJECTS_QUERY_KEY) ?? [];
      const now = new Date().toISOString();
      const optimistic: Project = {
        id: `optimistic-${crypto.randomUUID()}`,
        name: payload.name,
        description: payload.description ?? null,
        context: payload.context,
        status: "active",
        progress: 0,
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, [optimistic, ...previous]);
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project created");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Could not create project.");
    },
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
    onMutate: async ({ projectId, payload }) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Project[]>(PROJECTS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Project[]>(
        PROJECTS_QUERY_KEY,
        previous.map((project) =>
          project.id === projectId
            ? {
                ...project,
                name: payload.name ?? project.name,
                description: payload.description ?? project.description,
                context: payload.context ?? project.context,
                status: payload.status ?? project.status,
                progress: payload.progress ?? project.progress,
              }
            : project,
        ),
      );
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project updated");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: (error: Error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Could not update project.");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectService.remove(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Project[]>(PROJECTS_QUERY_KEY) ?? [];
      queryClient.setQueryData<Project[]>(
        PROJECTS_QUERY_KEY,
        previous.filter((project) => project.id !== projectId),
      );
      return { previous };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success("Project deleted");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
    onError: (error: Error, _projectId, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Could not delete project.");
    },
  });
}
