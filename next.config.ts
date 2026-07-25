import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
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

export default function createNextConfig(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  const sentryEnabledInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV === "true";
  const baseConfig: NextConfig = {
    allowedDevOrigins: getAllowedDevOrigins(),
    distDir: isDevServer ? ".next-dev" : ".next",
    env: {
      NEXT_PUBLIC_IS_DEV_SERVER: isDevServer ? "true" : "false",
    },
    reactStrictMode: true,
  };

  const shouldEnableSentryConfig = !isDevServer && (process.env.NODE_ENV === "production" || sentryEnabledInDev);

  return shouldEnableSentryConfig
    ? withSentryConfig(baseConfig, {
        silent: true,
      })
    : baseConfig;
}
