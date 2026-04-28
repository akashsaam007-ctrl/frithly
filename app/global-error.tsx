"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-cream text-ink">
        <main className="flex min-h-screen items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl">
            <ErrorState
              description="Frithly hit a problem before the page could finish loading. We've captured the error and you can try the request again."
              onRetry={reset}
              retryLabel="Reload Frithly"
              title="Frithly ran into a problem"
            />
          </div>
        </main>
      </body>
    </html>
  );
}
