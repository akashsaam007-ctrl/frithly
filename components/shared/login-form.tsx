"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

type FormState = "idle" | "loading" | "missing-account" | "success";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setFormState("loading");

    try {
      const response = await fetch("/api/auth/magic-link", {
        body: JSON.stringify({ email }),
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

  return (
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
        <div aria-live="polite" className="rounded-xl border border-border bg-cream p-4 text-sm text-muted">
          We don&apos;t have an account for this email.{" "}
          <Link className="font-semibold text-terracotta underline underline-offset-4" href={ROUTES.SAMPLE}>
            Get started here →
          </Link>
        </div>
      ) : null}

      {errorMessage ? (
        <div aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={formState === "loading"}>
        {formState === "loading" ? "Sending..." : "Send Magic Link"}
      </Button>
    </form>
  );
}
