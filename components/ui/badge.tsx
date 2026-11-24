import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none border",
  {
    variants: {
      variant: {
        neutral:
          "border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)]",
        blue: "border-[#cfe0ff] bg-[var(--tint-blue)] text-[var(--accent-blue-strong)]",
        purple: "border-[#dfd0ff] bg-[var(--tint-purple)] text-[var(--accent-purple-strong)]",
        cyan: "border-[#bcebeb] bg-[var(--tint-cyan)] text-[#0f5c63]",
        success:
          "border-[#bbf7d0] bg-[var(--status-success-bg)] text-[var(--status-success)]",
        warning:
          "border-[#fde68a] bg-[var(--status-warning-bg)] text-[var(--status-warning)]",
        danger:
          "border-[#fecaca] bg-[var(--status-danger-bg)] text-[var(--status-danger)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
