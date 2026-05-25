import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[var(--radius-button)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_10px_24px_rgba(109,93,252,0.35)] hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(109,93,252,0.45)]",
        ghost: "border border-border bg-surface text-foreground hover:bg-surface-elevated",
      },
      size: {
        default: "h-10 px-4",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
