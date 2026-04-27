import * as React from "react";
import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  width?: "content" | "narrow";
};

export function Container({
  as = "div",
  children,
  className,
  width = "content",
  ...props
}: ContainerProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        width === "narrow" ? "container-narrow" : "container-content",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
