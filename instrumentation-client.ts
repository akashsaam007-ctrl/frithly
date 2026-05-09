import * as Sentry from "@sentry/nextjs";

const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const sentryEnabled =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
  (process.env.NODE_ENV === "production" || sentryEnabledInDev);

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: true,
    sendDefaultPii: true,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.2,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
