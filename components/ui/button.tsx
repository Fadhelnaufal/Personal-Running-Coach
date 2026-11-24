import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-blue-strong)] text-white hover:bg-[#1d4ed8] shadow-xs",
        secondary:
          "bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[#e5eaf4] border border-[var(--border-subtle)]",
        outline:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
        danger:
          "bg-[var(--status-danger)] text-white hover:bg-[#991b1b]",
        pill:
          "rounded-full bg-[var(--tint-blue)] text-[var(--accent-blue-strong)] hover:bg-[#dfeaff]",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[44px] md:min-h-[36px] px-3 py-1.5 text-xs",
        lg: "min-h-[48px] px-5 py-2.5 text-base",
        icon: "min-h-[44px] min-w-[44px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
