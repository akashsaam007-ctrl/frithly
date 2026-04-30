"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT } from "@/lib/monitoring/consent";
import {
  capturePageView,
  hasPostHogConfiguration,
  syncAnalyticsConsent,
} from "@/lib/monitoring/posthog";

export function PostHogProvider() {
  const pathname = usePathname();
  const hasPostHog = hasPostHogConfiguration();

  useEffect(() => {
    if (!hasPostHog) {
      return;
    }

    function handleConsentChange() {
      void syncAnalyticsConsent();
    }

    handleConsentChange();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    window.addEventListener("storage", handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
      window.removeEventListener("storage", handleConsentChange);
    };
  }, [hasPostHog]);

  useEffect(() => {
    if (!hasPostHog) {
      return;
    }

    const search = typeof window === "undefined" ? "" : window.location.search;
    void capturePageView(pathname, search);
  }, [hasPostHog, pathname]);

  return null;
}
