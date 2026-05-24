"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Workspace failed to load</h1>
        <p className="text-sm text-muted-foreground">
          We could not load this workspace view. Retry first. If the issue continues, sign out and sign in again.
        </p>
        <Button onClick={reset}>Retry workspace</Button>
      </Card>
    </div>
  );
}
