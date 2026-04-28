"use client";

import { useEffect } from "react";
import { identifyAnalyticsUser } from "@/lib/monitoring/posthog";

type IdentifyUserProps = {
  distinctId: string;
  email?: string | null;
  type: "admin" | "customer";
};

export function IdentifyUser({ distinctId, email, type }: IdentifyUserProps) {
  useEffect(() => {
    identifyAnalyticsUser({
      distinctId,
      email,
      type,
    });
  }, [distinctId, email, type]);

  return null;
}
