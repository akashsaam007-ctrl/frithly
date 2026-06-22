import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[0.95rem] font-semibold transition-[background-color,border-color,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(196,181,253,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] disabled:pointer-events-none disabled:opacity-50",
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
        primary:
          "border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.02))] text-white shadow-[0_18px_48px_rgba(0,0,0,0.24)] hover:border-white/[0.12] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(255,255,255,0.03))] hover:shadow-[0_24px_56px_rgba(0,0,0,0.28)]",
        secondary: "border border-white/[0.08] bg-white/[0.04] text-ink hover:border-white/[0.14] hover:bg-white/[0.07]",
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
    const hydrationProps = asChild ? {} : { suppressHydrationWarning: true };

    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...hydrationProps}
        {...buttonProps}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
