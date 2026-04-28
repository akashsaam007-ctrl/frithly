"use client";

import { useEffect } from "react";
import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/monitoring/events";
import { captureEvent } from "@/lib/monitoring/posthog";

type PageEventProps = {
  name: AnalyticsEventName;
  oncePerSessionKey?: string;
  properties?: AnalyticsEventProperties;
};

export function PageEvent({
  name,
  oncePerSessionKey,
  properties,
}: PageEventProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (oncePerSessionKey) {
      const storageKey = `frithly-page-event:${oncePerSessionKey}`;

      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }

      window.sessionStorage.setItem(storageKey, "1");
    }

    captureEvent(name, properties);
  }, [name, oncePerSessionKey, properties]);

  return null;
}
