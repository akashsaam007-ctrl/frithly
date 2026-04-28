"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Paddle?: {
      Checkout: {
        open: (params: {
          settings?: Record<string, unknown>;
          transactionId?: string;
        }) => void;
      };
      Environment: {
        set: (environment: "production" | "sandbox") => void;
      };
      Initialize: (params: {
        checkout?: {
          settings?: Record<string, unknown>;
        };
        eventCallback?: (event: { name?: string }) => void;
        token: string;
      }) => void;
      Initialized?: boolean;
    };
  }
}

type PaddlePayLoaderProps = {
  appUrl: string;
  clientToken: string | null;
  environment: "live" | "sandbox";
  transactionId: string | null;
};

const scriptId = "frithly-paddle-js";

export function PaddlePayLoader({
  appUrl,
  clientToken,
  environment,
  transactionId,
}: PaddlePayLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "opening" | "ready">("idle");
  const openedTransactionRef = useRef<string | null>(null);

  const checkoutSettings = useMemo(
    () => ({
      allowLogout: false,
      displayMode: "overlay",
      locale: "en",
      successUrl: `${appUrl}/pricing?checkout=success`,
      theme: "light",
      variant: "one-page",
    }),
    [appUrl],
  );

  const openCheckout = useCallback(() => {
    if (!clientToken) {
      setError("Paddle client-side token is missing in this environment.");
      return;
    }

    if (!transactionId) {
      setError("This checkout link is missing its Paddle transaction ID.");
      return;
    }

    const paddle = window.Paddle;

    if (!paddle) {
      setError("Paddle.js did not load correctly.");
      return;
    }

    try {
      if (environment === "sandbox") {
        paddle.Environment.set("sandbox");
      }

      if (!paddle.Initialized) {
        paddle.Initialize({
          checkout: {
            settings: checkoutSettings,
          },
          eventCallback: (event) => {
            if (event.name === "checkout.completed") {
              setStatus("ready");
            }

            if (event.name === "checkout.closed") {
              setStatus("ready");
            }
          },
          token: clientToken,
        });
      }

      if (openedTransactionRef.current === transactionId) {
        return;
      }

      openedTransactionRef.current = transactionId;
      setStatus("opening");
      paddle.Checkout.open({
        settings: checkoutSettings,
        transactionId,
      });
      setStatus("ready");
    } catch (checkoutError) {
      console.error("Failed to open Paddle checkout", checkoutError);
      setError("We couldn't open Paddle checkout automatically. Use the button below to try again.");
      setStatus("ready");
    }
  }, [checkoutSettings, clientToken, environment, transactionId]);

  useEffect(() => {
    if (!clientToken || !transactionId) {
      return;
    }

    setStatus("loading");

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onReady = () => {
      setError(null);
      openCheckout();
    };

    if (existingScript?.dataset.loaded === "true") {
      onReady();
      return;
    }

    let script = existingScript;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => {
      script?.setAttribute("data-loaded", "true");
      onReady();
    };

    const handleError = () => {
      setStatus("ready");
      setError("Paddle.js could not be loaded. Check your network or content blockers and try again.");
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, [clientToken, openCheckout, transactionId]);

  if (!clientToken) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-white p-8 text-left">
        <p className="text-lg font-semibold text-ink">Paddle client token missing</p>
        <p className="text-muted">
          Add <code>NEXT_PUBLIC_PADDLE_CLIENT_TOKEN</code> in your local environment, then reload
          this checkout page.
        </p>
      </div>
    );
  }

  if (!transactionId) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-white p-8 text-left">
        <p className="text-lg font-semibold text-ink">Checkout link incomplete</p>
        <p className="text-muted">
          This payment link does not include the Paddle transaction ID required to open checkout.
          Start again from pricing and we&apos;ll generate a fresh checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-white p-8 text-left">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-ink">Secure checkout is opening</p>
        <p className="text-muted">
          We&apos;re handing you off to Paddle to collect payment securely for your Frithly
          subscription.
        </p>
      </div>

      <div className="rounded-xl bg-cream p-4 text-sm text-muted">
        <p>
          Status:{" "}
          <span className="font-semibold text-ink">
            {status === "loading"
              ? "Loading Paddle"
              : status === "opening"
                ? "Opening checkout"
                : "Ready"}
          </span>
        </p>
        <p className="mt-2">
          If the checkout doesn&apos;t appear, click the button below to open it again.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={openCheckout} type="button">
          Open secure checkout
        </Button>
        <Button asChild type="button" variant="secondary">
          <a href="/pricing">Back to pricing</a>
        </Button>
      </div>
    </div>
  );
}
