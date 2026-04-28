"use client";

import { useEffect, useRef } from "react";
import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/monitoring/events";
import { captureEvent } from "@/lib/monitoring/posthog";

type SectionViewEventProps = {
  name: AnalyticsEventName;
  oncePerSessionKey?: string;
  properties?: AnalyticsEventProperties;
  rootMargin?: string;
};

export function SectionViewEvent({
  name,
  oncePerSessionKey,
  properties,
  rootMargin = "0px 0px -20% 0px",
}: SectionViewEventProps) {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;

    if (!marker || typeof window === "undefined") {
      return;
    }

    const storageKey = oncePerSessionKey
      ? `frithly-section-event:${oncePerSessionKey}`
      : null;

    if (storageKey && window.sessionStorage.getItem(storageKey)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        if (storageKey) {
          window.sessionStorage.setItem(storageKey, "1");
        }

        captureEvent(name, properties);
        observer.disconnect();
      },
      {
        rootMargin,
        threshold: 0.35,
      },
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [name, oncePerSessionKey, properties, rootMargin]);

  return <span ref={markerRef} aria-hidden="true" className="sr-only" />;
}
