"use client";

import * as Sentry from "@sentry/nextjs";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentChoice,
} from "@/lib/monitoring/consent";
import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/monitoring/events";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

type PostHogClient = typeof import("posthog-js").default;

let posthogClient: PostHogClient | null = null;
let posthogLoadingPromise: Promise<PostHogClient | null> | null = null;
let posthogInitialized = false;

function getConsentChoice(): CookieConsentChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  const choice = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return choice === "accepted" || choice === "rejected" ? choice : null;
}

function sanitizeProperties(properties?: AnalyticsEventProperties) {
  if (!properties) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export function hasAnalyticsConsent() {
  return getConsentChoice() === "accepted";
}

export function hasPostHogConfiguration() {
  return Boolean(posthogToken);
}

async function loadPostHogClient() {
  if (!posthogToken || typeof window === "undefined") {
    return null;
  }

  if (posthogClient) {
    return posthogClient;
  }

  if (!posthogLoadingPromise) {
    posthogLoadingPromise = import("posthog-js").then((module) => {
      posthogClient = module.default;
      return posthogClient;
    });
  }

  return posthogLoadingPromise;
}

export async function syncAnalyticsConsent() {
  if (!posthogToken || typeof window === "undefined") {
    return false;
  }

  if (!hasAnalyticsConsent()) {
    if (posthogInitialized && posthogClient) {
      posthogClient.opt_out_capturing();
    }

    return false;
  }

  const client = await loadPostHogClient();

  if (!client) {
    return false;
  }

  if (!posthogInitialized) {
    client.init(posthogToken, {
      api_host: posthogHost,
      capture_pageleave: true,
      capture_pageview: false,
      person_profiles: "identified_only",
    });
    posthogInitialized = true;
  }

  client.opt_in_capturing();
  return true;
}

export function captureEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
) {
  void syncAnalyticsConsent().then((ready) => {
    if (!ready || !posthogClient) {
      return;
    }

    posthogClient.capture(eventName, sanitizeProperties(properties));
  });
}

export function capturePageView(pathname: string, search: string) {
  if (typeof window === "undefined") {
    return;
  }

  void syncAnalyticsConsent().then((ready) => {
    if (!ready || !posthogClient) {
      return;
    }

    posthogClient.capture("$pageview", {
      pathname,
      search,
      url: window.location.href,
    });
  });
}

export function identifyAnalyticsUser(params: {
  distinctId: string;
  email?: string | null;
  type: "admin" | "customer";
}) {
  Sentry.setUser({
    email: params.email ?? undefined,
    id: params.distinctId,
  });

  void syncAnalyticsConsent().then((ready) => {
    if (!ready || !posthogClient) {
      return;
    }

    posthogClient.identify(params.distinctId, {
      account_type: params.type,
      email: params.email ?? undefined,
    });
  });
}

export function resetAnalyticsUser() {
  Sentry.setUser(null);

  if (!posthogInitialized) {
    return;
  }

  posthogClient?.reset();
}
