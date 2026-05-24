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
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Workspace name" />
          <select
            className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as "private" | "team")}
          >
            <option value="private">Private</option>
            <option value="team">Team</option>
          </select>
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
        </div>
      </Card>

      {isLoading ? <Card>Loading workspaces...</Card> : null}
      {isError ? <Card className="text-danger">Unable to load workspaces.</Card> : null}
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
