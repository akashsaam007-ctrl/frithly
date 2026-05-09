import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

function getAllowedDevOrigins() {
  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!configuredUrl) {
    return defaults;
  }

  try {
    const origin = new URL(configuredUrl).origin;

    return Array.from(new Set([...defaults, origin]));
  } catch {
    return defaults;
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  reactStrictMode: true,
};

const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
const shouldEnableSentryConfig =
  process.env.NODE_ENV === "production" || sentryEnabledInDev;

export default shouldEnableSentryConfig
  ? withSentryConfig(nextConfig, {
      silent: true,
    })
  : nextConfig;
