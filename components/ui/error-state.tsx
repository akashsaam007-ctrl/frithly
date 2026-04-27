"use client";

import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  action?: ReactNode;
  className?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
};

export function ErrorState({
  action,
  className,
  description,
  onRetry,
  retryLabel = "Try again",
  title = "Something went wrong",
}: ErrorStateProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-ink">{title}</h3>
          <p className="mx-auto max-w-xl text-muted">{description}</p>
        </div>
        {action}
        {!action && onRetry ? (
          <Button onClick={onRetry} variant="secondary">
            {retryLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
