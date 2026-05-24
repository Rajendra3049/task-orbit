"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthError({
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
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Authentication issue</h1>
        <p className="text-sm text-muted-foreground">
          We could not complete the authentication request. Retry, then verify your credentials and network.
        </p>
        <Button onClick={reset}>Retry authentication</Button>
      </Card>
    </main>
  );
}
