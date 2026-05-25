"use client";

import { addDays } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateTask, useTasks } from "@/features/tasks/hooks/use-tasks";

type AssistantActionResult = {
  title: string;
  dueDate?: string;
  context: "work" | "personal" | "general";
  priority: "p0" | "p1" | "p2" | "p3";
};

function parseAssistantCommand(command: string): AssistantActionResult | null {
  const normalized = command.trim().toLowerCase();
  if (!normalized) return null;

  const dueTomorrow = normalized.includes("tomorrow") ? addDays(new Date(), 1).toISOString() : undefined;
  const context = normalized.includes("office") || normalized.includes("work") ? "work" : normalized.includes("personal") ? "personal" : "general";
  const priority = normalized.includes("urgent") || normalized.includes("p0") || normalized.includes("critical")
    ? "p0"
    : normalized.includes("p1") || normalized.includes("high")
      ? "p1"
      : normalized.includes("p3") || normalized.includes("low")
        ? "p3"
        : "p2";

  const cleanedTitle = command
    .replace(/tomorrow/gi, "")
    .replace(/urgent|critical|p0|p1|p2|p3|high priority|low priority/gi, "")
    .replace(/create task|add task|remind me to/gi, "")
    .trim();

  if (!cleanedTitle) return null;

  return { title: cleanedTitle, dueDate: dueTomorrow, context, priority };
}

export function AssistantPanel() {
  const [command, setCommand] = useState("");
  const createTask = useCreateTask();
  const { data: tasks } = useTasks();

  const suggestions = [
    "Create task submit weekly report tomorrow urgent",
    "Remind me to review roadmap tomorrow office",
    "Add task workout personal",
  ];

  const runCommand = async () => {
    const parsed = parseAssistantCommand(command);
    if (!parsed) {
      return;
    }
    await createTask.mutateAsync({
      title: parsed.title,
      dueDate: parsed.dueDate,
      context: parsed.context,
      priority: parsed.priority,
    });
    setCommand("");
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Natural-language command parser for quick capture and prioritization.
        </p>
        <label htmlFor="assistant-command" className="text-xs font-medium text-muted-foreground">
          Task command
        </label>
        <Input
          id="assistant-command"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder='Try: "Plan my top 3 tasks for tomorrow"'
          aria-describedby="assistant-command-help"
        />
        <p id="assistant-command-help" className="text-xs text-muted-foreground">
          Use plain language and include words like tomorrow, urgent, work, or personal.
        </p>
        <Button title="Parse command and create task action" onClick={() => void runCommand()} disabled={createTask.isPending}>
          {createTask.isPending ? "Running..." : "Run command"}
        </Button>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Prompt suggestions</p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="block w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setCommand(suggestion)}
              aria-label={`Use suggestion: ${suggestion}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">
          Current task load: {tasks?.length ?? 0} tasks. Tip: use explicit terms like tomorrow, urgent, work, or personal for best parsing.
        </p>
      </Card>
    </div>
  );
}
