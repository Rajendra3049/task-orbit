import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      neutral: "bg-surface-elevated text-foreground",
      success: "bg-success/20 text-success",
      warning: "bg-warning/20 text-warning",
      danger: "bg-danger/20 text-danger",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
