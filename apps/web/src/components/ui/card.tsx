import * as React from "react";
import { cn } from "@/shared/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "gradient-ring rounded-[var(--radius-card)] border border-border bg-surface p-5 text-foreground shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
