"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function isSafeNextPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function getVerifyHeading(nextPath: string | null) {
  if (nextPath?.startsWith("/checkout/")) {
    return {
      description: "One moment while we sign you in and take you to secure checkout.",
      title: "Preparing your checkout",
    };
  }

  return {
    description: "One moment while we log you in and send you to your dashboard.",
    title: "Verifying your sign-in",
  };
}

function VerifyPageContent() {
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const verifyCopy = getVerifyHeading(nextPath);

  useEffect(() => {
    let cancelled = false;

    async function verifyMagicLink() {
      const supabase = createSupabaseBrowserClient();
      const code = searchParams.get("code");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const errorDescription =
        searchParams.get("error_description") ?? hashParams.get("error_description");
      const nextPath = searchParams.get("next");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const storedNextPath = window.sessionStorage.getItem("frithly-post-auth-next");
      const storedProvider = window.sessionStorage.getItem("frithly-post-auth-provider");
      const resolvedNextPath = isSafeNextPath(nextPath)
        ? nextPath
        : isSafeNextPath(storedNextPath)
          ? storedNextPath
          : null;

      try {
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        } else if (tokenHash && type) {
          let verified = false;
          let lastError: Error | null = null;

          for (const candidateType of [type, "email", "magiclink"] as EmailOtpType[]) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: candidateType,
            });

            if (!error) {
              verified = true;
              break;
            }

            lastError = error;
          }

          if (!verified) {
            throw lastError ?? new Error("Unable to verify magic link");
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            if (storedProvider === "google" && resolvedNextPath?.startsWith("/checkout/")) {
              const restartUrl = new URL(ROUTES.LOGIN, window.location.origin);

              restartUrl.searchParams.set("auth", "google");
              restartUrl.searchParams.set("next", resolvedNextPath);
              window.location.assign(restartUrl.toString());
              return;
            }

            throw new Error("Missing verification parameters");
          }
        }

        if (!cancelled) {
          if (resolvedNextPath) {
            window.sessionStorage.removeItem("frithly-post-auth-next");
            window.sessionStorage.removeItem("frithly-post-auth-provider");
            window.location.assign(resolvedNextPath);
            return;
          }

          const destinationResponse = await fetch("/api/auth/session-destination", {
            cache: "no-store",
          });
          const destinationPayload = (await destinationResponse.json()) as {
            destination?: string;
          };

          window.sessionStorage.removeItem("frithly-post-auth-provider");
          window.location.assign(destinationPayload.destination ?? ROUTES.DASHBOARD);
        }
      } catch (error) {
        console.error("Magic link verification failed", error);

        if (storedProvider === "google" && resolvedNextPath?.startsWith("/checkout/")) {
          const restartUrl = new URL(ROUTES.LOGIN, window.location.origin);

          restartUrl.searchParams.set("auth", "google");
          restartUrl.searchParams.set("next", resolvedNextPath);
          window.location.assign(restartUrl.toString());
          return;
        }

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
          <h1 className="text-3xl md:text-4xl">{verifyCopy.title}</h1>
          <p className="text-muted">{verifyCopy.description}</p>
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
              <h1 className="text-3xl md:text-4xl">Verifying your sign-in</h1>
              <p className="text-muted">
                One moment while we log you in and get your next step ready.
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
