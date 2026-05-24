"use client";

import { Card } from "@/components/ui/card";
import { useAuthUser } from "@/shared/hooks/use-auth";
import { useUiStore } from "@/shared/store/ui-store";

export function DashboardHero() {
  const mode = useUiStore((state) => state.mode);
  const { data: user } = useAuthUser();
  const firstName =
    user?.user_metadata?.full_name?.split(" ")?.[0] || user?.email?.split("@")?.[0] || "there";

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(109,93,252,0.28),transparent_45%)]" />
      <div className="relative space-y-2">
        <p className="text-sm text-muted-foreground">
          {mode === "office" ? "Office workspace" : "Personal workspace"}
        </p>
        <h1 className="text-2xl font-semibold md:text-3xl">Good evening, {firstName}</h1>
        <p className="text-sm text-muted-foreground">
          Focus on your top three tasks and keep momentum through small wins.
        </p>
      </div>
    </Card>
  );
}
