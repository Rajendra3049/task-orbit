export type Workspace = {
  id: string;
  name: string;
  visibility: "private" | "team";
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceInput = {
  name: string;
  visibility: "private" | "team";
};
