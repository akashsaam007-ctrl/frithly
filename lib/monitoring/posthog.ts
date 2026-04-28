"use client";

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
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

export function syncAnalyticsConsent() {
  if (!posthogToken || typeof window === "undefined") {
    return false;
  }

  if (!hasAnalyticsConsent()) {
    if (posthogInitialized) {
      posthog.opt_out_capturing();
    }

    return false;
  }

  if (!posthogInitialized) {
    posthog.init(posthogToken, {
      api_host: posthogHost,
      capture_pageleave: true,
      capture_pageview: false,
      person_profiles: "identified_only",
    });
    posthogInitialized = true;
  }

  posthog.opt_in_capturing();
  return true;
}

export function captureEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties,
) {
  if (!syncAnalyticsConsent()) {
    return;
  }

  posthog.capture(eventName, sanitizeProperties(properties));
}

export function capturePageView(pathname: string, search: string) {
  if (!syncAnalyticsConsent() || typeof window === "undefined") {
    return;
  }

  posthog.capture("$pageview", {
    pathname,
    search,
    url: window.location.href,
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

  if (!syncAnalyticsConsent()) {
    return;
  }

  posthog.identify(params.distinctId, {
    account_type: params.type,
    email: params.email ?? undefined,
  });
}

export function resetAnalyticsUser() {
  Sentry.setUser(null);

  if (!posthogInitialized) {
    return;
  }

  posthog.reset();
}
