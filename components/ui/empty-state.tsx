import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
        </span>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-ink">{title}</h3>
          <p className="mx-auto max-w-xl text-muted">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
