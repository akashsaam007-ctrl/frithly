import "server-only";

import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
} from "@/lib/monitoring/events";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

export async function captureServerEvent(params: {
  distinctId: string;
  eventName: AnalyticsEventName;
  properties?: AnalyticsEventProperties;
}) {
  if (!posthogToken) {
    return;
  }

  try {
    await fetch(`${posthogHost.replace(/\/$/, "")}/capture/`, {
      body: JSON.stringify({
        api_key: posthogToken,
        distinct_id: params.distinctId,
        event: params.eventName,
        properties: params.properties ?? {},
        token: posthogToken,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch (error) {
    console.error("PostHog server event capture failed", {
      distinctId: params.distinctId,
      error,
      eventName: params.eventName,
    });
  }
}
