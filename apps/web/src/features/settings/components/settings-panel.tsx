"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSaveWorkspaceMode, useWorkspaceMode } from "@/features/settings/hooks/use-workspace-mode";
import { useUiStore } from "@/shared/store/ui-store";

export function SettingsPanel() {
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const { data: savedMode } = useWorkspaceMode();
  const saveMode = useSaveWorkspaceMode();

  const setAndPersistMode = async (nextMode: "personal" | "office") => {
    setMode(nextMode);
    await saveMode.mutateAsync(nextMode);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure workspace preferences, notifications, and integrations.
        </p>
      </Card>
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Mode Behavior</h2>
        <p className="text-sm text-muted-foreground">
          Office mode prioritizes work context and automatically hides personal tasks.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={mode === "personal" ? "primary" : "ghost"}
            onClick={() => void setAndPersistMode("personal")}
            disabled={saveMode.isPending}
          >
            Personal
          </Button>
          <Button
            variant={mode === "office" ? "primary" : "ghost"}
            onClick={() => void setAndPersistMode("office")}
            disabled={saveMode.isPending}
          >
            Office
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Active mode: {mode}. Saved mode: {savedMode ?? "not loaded"}.
        </p>
      </Card>
      <Card className="space-y-2">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Integration connectors are ready for wiring: Google Calendar, Outlook, Slack, GitHub.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <IntegrationItem name="Google Calendar" status="Coming next" />
          <IntegrationItem name="Outlook Calendar" status="Coming next" />
          <IntegrationItem name="Slack" status="Coming next" />
          <IntegrationItem name="GitHub" status="Coming next" />
        </div>
      </Card>
    </div>
  );
}

function IntegrationItem({ name, status }: { name: string; status: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">{status}</p>
    </div>
  );
}
