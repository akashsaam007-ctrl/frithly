"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import { isDemoMode } from "@/lib/utils/mode";

type FormState = "idle" | "loading" | "missing-account" | "success";

type LoginFormProps = {
  initialEmail?: string;
  nextPath?: string;
  preferredAuth?: "google";
};

export function LoginForm({
  initialEmail = "",
  nextPath = "",
  preferredAuth,
}: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [isMounted, setIsMounted] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const hasAutoStartedGoogle = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setErrorMessage("");
    setIsOAuthLoading(true);

    try {
      if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        window.sessionStorage.setItem("frithly-post-auth-next", nextPath);
      } else {
        window.sessionStorage.removeItem("frithly-post-auth-next");
      }

      window.sessionStorage.setItem("frithly-post-auth-provider", "google");

      const supabase = createSupabaseBrowserClient();
      const redirectUrl = new URL("/verify", window.location.origin);

      if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        redirectUrl.searchParams.set("next", nextPath);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        options: {
          queryParams: {
            prompt: "select_account",
          },
          redirectTo: redirectUrl.toString(),
        },
        provider: "google",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setIsOAuthLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't start Google sign-in.",
      );
    }
  }, [nextPath]);

  useEffect(() => {
    if (!isMounted || preferredAuth !== "google" || hasAutoStartedGoogle.current) {
      return;
    }

    hasAutoStartedGoogle.current = true;
    void handleGoogleSignIn();
  }, [handleGoogleSignIn, isMounted, preferredAuth]);

  if (!isMounted) {
    return (
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="h-5 w-20 rounded bg-ink/5" />
          <div className="h-12 w-full rounded-lg border border-border bg-white" />
        </div>
        <div className="h-12 w-full rounded-lg bg-terracotta/15" />
      </div>
    );
  }

  if (isDemoMode) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-cream p-4 text-sm text-muted">
          Demo mode is enabled locally, so auth is bypassed for previewing the customer and admin
          areas.
        </div>

        <div className="grid gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href={ROUTES.DASHBOARD}>Open Customer Dashboard</Link>
          </Button>
          <Button asChild className="w-full" size="lg" variant="secondary">
            <Link href={ROUTES.ADMIN_CUSTOMERS}>Open Admin Customers</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setFormState("loading");

    try {
      const response = await fetch("/api/auth/magic-link", {
        body: JSON.stringify({
          email,
          nextPath,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { code?: string; error?: string };

      if (!response.ok) {
        if (payload.code === "account_not_found") {
          setFormState("missing-account");
          return;
        }

        throw new Error(payload.error ?? "We couldn't send your magic link.");
      }

      setFormState("success");
    } catch (error) {
      setFormState("idle");
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't send your magic link.",
      );
    }
  }

  if (formState === "success") {
    return (
      <div aria-live="polite" className="space-y-3 rounded-xl bg-cream p-5 text-center">
        <h3 className="text-xl font-semibold text-ink">Check your inbox</h3>
        <p className="text-muted">
          We sent a secure magic link to <span className="font-semibold text-ink">{email}</span>.
        </p>
      </div>
    );
  }

  const isGoogleOnlyFlow = preferredAuth === "google";

  return (
    <div className="space-y-5">
      <Button
        className="w-full"
        disabled={isOAuthLoading || formState === "loading"}
        size="lg"
        type="button"
        variant="secondary"
        onClick={() => void handleGoogleSignIn()}
      >
        <span className="inline-flex items-center gap-3">
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M21.805 10.023H12.25v3.955h5.52c-.238 1.273-.953 2.352-2.033 3.076v2.553h3.295c1.93-1.777 3.045-4.395 3.045-7.495 0-.714-.064-1.401-.272-2.089Z"
              fill="#4285F4"
            />
            <path
              d="M12.25 22c2.754 0 5.064-.908 6.75-2.453l-3.295-2.553c-.908.613-2.073.987-3.455.987-2.654 0-4.904-1.79-5.71-4.193H3.133v2.633A10.187 10.187 0 0 0 12.25 22Z"
              fill="#34A853"
            />
            <path
              d="M6.54 13.788A6.126 6.126 0 0 1 6.222 12c0-.622.111-1.223.318-1.788V7.58H3.133A10.187 10.187 0 0 0 2 12c0 1.641.393 3.194 1.133 4.42l3.407-2.632Z"
              fill="#FBBC05"
            />
            <path
              d="M12.25 6.02c1.5 0 2.843.515 3.9 1.53l2.922-2.92C17.309 2.98 15 2 12.25 2 8.266 2 4.82 4.286 3.133 7.58l3.407 2.633C7.346 7.81 9.596 6.02 12.25 6.02Z"
              fill="#EA4335"
            />
          </svg>
          {isOAuthLoading ? "Redirecting to Google..." : "Continue with Google"}
        </span>
      </Button>

      {isGoogleOnlyFlow ? (
        <>
          <div className="rounded-xl border border-border bg-cream p-4 text-sm text-muted">
            We&apos;re using Google sign-in for this checkout so we can take you straight into
            payment after you choose your account.
          </div>

          {errorMessage ? (
            <div
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 text-sm text-muted">
            <div className="h-px flex-1 bg-border" />
            <span>or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                required
                autoComplete="email"
                id="email"
                name="email"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {formState === "missing-account" ? (
              <div
                aria-live="polite"
                className="rounded-xl border border-border bg-cream p-4 text-sm text-muted"
              >
                We don&apos;t have an account for this email yet.{" "}
                <Link
                  className="font-semibold text-terracotta underline underline-offset-4"
                  href={ROUTES.SAMPLE}
                >
                  Get started here -&gt;
                </Link>
              </div>
            ) : null}

            {errorMessage ? (
              <div
                aria-live="polite"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            ) : null}

            <Button
              className="w-full"
              disabled={formState === "loading" || isOAuthLoading}
              size="lg"
              type="submit"
            >
              {formState === "loading" ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
