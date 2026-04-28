"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { COOKIE_CONSENT_CHANGED_EVENT } from "@/lib/monitoring/consent";
import { capturePageView, syncAnalyticsConsent } from "@/lib/monitoring/posthog";

type PostHogProviderProps = {
  children: React.ReactNode;
};

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    function handleConsentChange() {
      syncAnalyticsConsent();
    }

    handleConsentChange();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    window.addEventListener("storage", handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
      window.removeEventListener("storage", handleConsentChange);
    };
  }, []);

  useEffect(() => {
    const search = typeof window === "undefined" ? "" : window.location.search;
    capturePageView(pathname, search);
  }, [pathname]);

  return children;
}
