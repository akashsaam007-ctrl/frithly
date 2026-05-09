import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    variants: {
      size: {
        lg: "h-12 px-6 text-base",
        md: "h-11 px-5 text-sm",
        sm: "h-10 px-4 text-sm",
      },
      variant: {
        ghost: "bg-transparent text-ink hover:bg-white/[0.06] hover:text-ink",
        primary: "bg-terracotta text-white hover:bg-terracotta-dark",
        secondary: "border border-white/12 bg-white/[0.05] text-ink hover:border-white/24 hover:bg-white/[0.09]",
      },
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, type = "button", variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const buttonProps = asChild ? props : { type, ...props };

    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...buttonProps}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
