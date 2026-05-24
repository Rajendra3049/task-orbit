"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace, useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";

export function WorkspaceHub() {
  const { data, isLoading, isError } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<"private" | "team">("private");

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Workspaces</h1>
        <p className="text-sm text-muted-foreground">
          Collaboration foundation: create private or team workspace and prepare for member invites.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="workspace-name" className="mb-1 block text-xs font-medium text-muted-foreground">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Product Team FY26"
            />
          </div>
          <div>
            <label htmlFor="workspace-visibility" className="mb-1 block text-xs font-medium text-muted-foreground">
              Visibility
            </label>
            <select
              id="workspace-visibility"
              className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "private" | "team")}
            >
              <option value="private">Private</option>
              <option value="team">Team</option>
            </select>
          </div>
          <Button
            onClick={() =>
              createWorkspace.mutate({
                name: name.trim(),
                visibility,
              })
            }
            disabled={!name.trim()}
          >
            Create workspace
          </Button>
          <p className="md:col-span-3 text-xs text-muted-foreground">
            Team workspaces stay private until you invite members and assign roles.
          </p>
        </div>
      </Card>

      {isLoading ? <Card>Loading workspaces...</Card> : null}
      {isError ? <Card className="text-danger">Unable to load workspaces.</Card> : null}
      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No workspaces yet. Create one to organize shared projects and member permissions.
          </p>
        </Card>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {(data ?? []).map((workspace) => (
          <Card key={workspace.id} className="space-y-2">
            <h3 className="text-lg font-semibold">{workspace.name}</h3>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{workspace.visibility}</p>
            <p className="text-sm text-muted-foreground">Invites and member roles are the next collaboration step.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
