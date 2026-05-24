import * as React from "react";
import { cn } from "@/shared/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:bg-surface-elevated focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  );
}
