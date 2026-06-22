const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDevServer = process.env.NEXT_PUBLIC_IS_DEV_SERVER === "true";
const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const sentryEnabled =
  Boolean(dsn) && (!isDevServer || sentryEnabledInDev);

if (sentryEnabled && dsn) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      enabled: true,
      sendDefaultPii: true,
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.2,
    });
  });
}

export {};
