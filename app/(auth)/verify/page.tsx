"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function VerifyPageContent() {
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function verifyMagicLink() {
      const supabase = createSupabaseBrowserClient();
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });

          if (error) {
            throw error;
          }
        } else {
          throw new Error("Missing verification parameters");
        }

        if (!cancelled) {
          router.replace(ROUTES.DASHBOARD);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    void verifyMagicLink();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (hasError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="w-full max-w-[520px]">
          <ErrorState
            title="Link expired"
            description="This magic link is no longer valid. Try signing in again and we'll send you a fresh one."
            onRetry={() => router.push(ROUTES.LOGIN)}
            retryLabel="Try again"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner className="text-terracotta" />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl">Verifying your magic link</h1>
          <p className="text-muted">One moment while we log you in and send you to your dashboard.</p>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner className="text-terracotta" />
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl">Verifying your magic link</h1>
              <p className="text-muted">
                One moment while we log you in and send you to your dashboard.
              </p>
            </div>
          </div>
        </main>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
