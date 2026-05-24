import { Card } from "@/components/ui/card";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-surface-elevated" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-surface-elevated" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-surface-elevated" />
          <div className="h-24 animate-pulse rounded-xl bg-surface-elevated" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </Card>
    </div>
  );
}
