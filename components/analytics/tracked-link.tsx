"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/monitoring/events";
import { captureEvent } from "@/lib/monitoring/posthog";

type TrackedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    eventName?: AnalyticsEventName;
    eventProperties?: AnalyticsEventProperties;
  };

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  (
    {
      eventName,
      eventProperties,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <Link
        ref={ref}
        {...props}
        onClick={(event) => {
          if (eventName) {
            captureEvent(eventName, eventProperties);
          }

          onClick?.(event);
        }}
      />
    );
  },
);

TrackedLink.displayName = "TrackedLink";
