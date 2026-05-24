export type ProjectContext = "work" | "personal" | "general";
export type ProjectStatus = "active" | "on_hold" | "completed";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  context: ProjectContext;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  context: ProjectContext;
};
