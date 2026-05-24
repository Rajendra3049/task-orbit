"use client";

import { Card } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useUiStore } from "@/shared/store/ui-store";

export function ProjectList() {
  const { data, isLoading, isError } = useProjects();
  const mode = useUiStore((state) => state.mode);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <p className="text-sm text-danger">Unable to load projects.</p>
      </Card>
    );
  }

  const projects = (data ?? []).filter((project) => (mode === "office" ? project.context !== "personal" : true));

  if (projects.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No projects yet. Create your first project.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {projects.map((project) => (
        <Card key={project.id} className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.context}</p>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
          <p className="text-xs text-muted-foreground">Progress: {project.progress}%</p>
        </Card>
      ))}
    </div>
  );
}
