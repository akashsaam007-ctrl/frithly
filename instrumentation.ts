import type { captureRequestError } from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

const isDevServer = process.env.NEXT_PUBLIC_IS_DEV_SERVER === "true";
const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const sentryEnabled =
  Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) &&
  (!isDevServer || sentryEnabledInDev);

type RequestErrorArgs = Parameters<typeof captureRequestError>;

export function onRequestError(...args: RequestErrorArgs) {
  if (!sentryEnabled) {
    return;
  }

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureRequestError?.(...args);
  });
}
