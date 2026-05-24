"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateProject } from "@/features/projects/hooks/use-projects";

export function ProjectForm() {
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState<"work" | "personal" | "general">("work");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      context,
    });
    setName("");
    setDescription("");
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Create project</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <Input
          className="md:col-span-2"
          placeholder="e.g., Mobile app launch"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          placeholder="Outcome, owner, or deadline context"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <select
          className="h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm"
          value={context}
          onChange={(event) => setContext(event.target.value as "work" | "personal" | "general")}
        >
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="general">General</option>
        </select>
        <Button type="submit" className="md:col-span-2" disabled={createProject.isPending}>
          {createProject.isPending ? "Creating..." : "Create project"}
        </Button>
      </form>
    </Card>
  );
}
