"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <ErrorState
          description="This part of Frithly couldn't finish loading. We've logged the failure so you can retry safely."
          onRetry={reset}
          retryLabel="Try again"
          title="Something went wrong here"
        />
      </div>
    </main>
  );
}
