import type { captureRouterTransitionStart } from "@sentry/nextjs";

const isDevServer = process.env.NEXT_PUBLIC_IS_DEV_SERVER === "true";
const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const sentryEnabled =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
  (!isDevServer || sentryEnabledInDev);

type RouterTransitionArgs = Parameters<typeof captureRouterTransitionStart>;

let sentryClientPromise: Promise<typeof import("@sentry/nextjs")> | null = null;
let sentryClientInitialized = false;

function ensureSentryClient() {
  if (!sentryEnabled) {
    return null;
  }

  if (!sentryClientPromise) {
    sentryClientPromise = import("@sentry/nextjs");
  }

  return sentryClientPromise.then((Sentry) => {
    if (!sentryClientInitialized) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        enabled: true,
        sendDefaultPii: true,
        tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.2,
      });
      sentryClientInitialized = true;
    }

    return Sentry;
  });
}

if (sentryEnabled) {
  void ensureSentryClient();
}

export function onRouterTransitionStart(...args: RouterTransitionArgs) {
  if (!sentryEnabled) {
    return;
  }

  void ensureSentryClient()?.then((Sentry) => {
    Sentry.captureRouterTransitionStart?.(...args);
  });
}
