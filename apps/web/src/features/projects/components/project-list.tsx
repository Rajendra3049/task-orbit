"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteProject, useProjects, useUpdateProject } from "@/features/projects/hooks/use-projects";
import { useUiStore } from "@/shared/store/ui-store";

export function ProjectList() {
  const { data, isLoading, isError } = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const mode = useUiStore((state) => state.mode);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const handleDelete = (projectId: string) => {
    const shouldDelete = window.confirm("Delete this project? Linked tasks will stay but become unassigned.");
    if (!shouldDelete) return;
    deleteProject.mutate(projectId);
  };

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
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.context}</p>
            <Button
              variant="ghost"
              size="icon"
              title="Delete project"
              onClick={() => handleDelete(project.id)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>

          {editingProjectId === project.id ? (
            <div className="space-y-2">
              <Input value={editedName} onChange={(event) => setEditedName(event.target.value)} />
              <Input value={editedDescription} onChange={(event) => setEditedDescription(event.target.value)} />
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    updateProject.mutate(
                      {
                        projectId: project.id,
                        payload: {
                          name: editedName.trim(),
                          description: editedDescription.trim(),
                        },
                      },
                      {
                        onSuccess: () => setEditingProjectId(null),
                      },
                    )
                  }
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditingProjectId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
              <p className="text-xs text-muted-foreground">Progress: {project.progress}%</p>
              <Button
                variant="ghost"
                title="Edit project details"
                onClick={() => {
                  setEditingProjectId(project.id);
                  setEditedName(project.name);
                  setEditedDescription(project.description || "");
                }}
              >
                Edit project
              </Button>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
