"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

const shouldCaptureErrors =
  process.env.NEXT_PUBLIC_IS_DEV_SERVER !== "true" ||
  process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!shouldCaptureErrors) {
      return;
    }

    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error);
    });
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
