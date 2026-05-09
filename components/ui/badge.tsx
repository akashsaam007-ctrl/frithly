import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-terracotta/10 text-terracotta",
        muted: "bg-white/[0.06] text-muted",
        outline: "border border-white/10 bg-white/[0.05] text-ink",
        success: "bg-emerald-400/12 text-emerald-200",
      },
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ className, variant }))} {...props} />;
}

export { Badge, badgeVariants };
