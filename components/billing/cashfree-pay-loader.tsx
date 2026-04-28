"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Cashfree?: (params: {
      mode: "production" | "sandbox";
    }) => {
      subscriptionsCheckout: (params: {
        redirectTarget?: "_blank" | "_self";
        subsSessionId: string;
      }) => Promise<{ error?: { message?: string } }>;
    };
  }
}

type CashfreePayLoaderProps = {
  environment: "production" | "sandbox";
  subscriptionId: string | null;
  subscriptionSessionId: string | null;
};

const scriptId = "frithly-cashfree-js";

export function CashfreePayLoader({
  environment,
  subscriptionId,
  subscriptionSessionId,
}: CashfreePayLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "opening" | "ready">("idle");
  const openedSessionRef = useRef<string | null>(null);

  const openCheckout = useCallback(async () => {
    if (!subscriptionSessionId) {
      setError("This subscription is missing its Cashfree session ID.");
      return;
    }

    if (!window.Cashfree) {
      setError("Cashfree checkout did not load correctly.");
      return;
    }

    try {
      const cashfree = window.Cashfree({ mode: environment });

      if (openedSessionRef.current === subscriptionSessionId) {
        return;
      }

      openedSessionRef.current = subscriptionSessionId;
      setStatus("opening");
      const result = await cashfree.subscriptionsCheckout({
        redirectTarget: "_self",
        subsSessionId: subscriptionSessionId,
      });

      if (result?.error?.message) {
        setError(result.error.message);
      }

      setStatus("ready");
    } catch (checkoutError) {
      console.error("Failed to open Cashfree checkout", checkoutError);
      setError(
        "We couldn't open Cashfree checkout automatically. Use the button below to try again.",
      );
      setStatus("ready");
    }
  }, [environment, subscriptionSessionId]);

  useEffect(() => {
    if (!subscriptionSessionId) {
      return;
    }

    setStatus("loading");
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onReady = () => {
      setError(null);
      void openCheckout();
    };

    if (existingScript?.dataset.loaded === "true") {
      onReady();
      return;
    }

    let script = existingScript;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      script?.setAttribute("data-loaded", "true");
      onReady();
    };

    const handleError = () => {
      setStatus("ready");
      setError(
        "Cashfree checkout could not be loaded. Check your network or content blockers and try again.",
      );
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, [openCheckout, subscriptionSessionId]);

  if (!subscriptionSessionId) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-white p-8 text-left">
        <p className="text-lg font-semibold text-ink">Checkout link incomplete</p>
        <p className="text-muted">
          This payment link does not include the Cashfree subscription session required to open
          checkout. Start again from pricing and we&apos;ll generate a fresh authorisation session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-white p-8 text-left">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-ink">Secure authorisation is opening</p>
        <p className="text-muted">
          We&apos;re handing you off to Cashfree&apos;s hosted subscription checkout to authorise
          your recurring Frithly plan.
        </p>
      </div>

      <div className="rounded-xl bg-cream p-4 text-sm text-muted">
        <p>
          Status:{" "}
          <span className="font-semibold text-ink">
            {status === "loading"
              ? "Loading Cashfree"
              : status === "opening"
                ? "Opening checkout"
                : "Ready"}
          </span>
        </p>
        {subscriptionId ? (
          <p className="mt-2">Subscription reference: {subscriptionId}</p>
        ) : null}
        <p className="mt-2">
          If the checkout doesn&apos;t appear, use the button below to open it again.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void openCheckout()} type="button">
          Open secure authorisation
        </Button>
        <Button asChild type="button" variant="secondary">
          <a href="/pricing">Back to pricing</a>
        </Button>
      </div>
    </div>
  );
}
