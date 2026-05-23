import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageEvent } from "@/components/analytics/page-event";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { PlatformHomepage } from "@/components/landing/platform-homepage";
import { StructuredData } from "@/components/seo/structured-data";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildServiceSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Frithly helps agencies, founders, and outbound teams get more meetings from smaller, higher-intent prospect lists with live signals, verified contacts, and weekly ready-to-send briefs.",
  keywords: [
    "higher reply rate outbound",
    "weekly outbound brief",
    "signal based prospecting",
    "better fit outbound leads",
    "outbound research service",
    "lead intelligence for SDR teams",
  ],
  path: "/",
  title: "Frithly | Smaller Lists. Better Timing. Stronger Replies.",
});

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
) {
  const normalized = new URLSearchParams();

  if (!searchParams) {
    return normalized;
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const firstValue = value[0];

      if (firstValue) {
        normalized.set(key, firstValue);
      }

      return;
    }

    if (value) {
      normalized.set(key, value);
    }
  });

  return normalized;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);

  if (
    normalizedSearchParams.has("code") ||
    normalizedSearchParams.has("error_description")
  ) {
    const queryString = normalizedSearchParams.toString();
    redirect(queryString ? `/auth/callback?${queryString}` : "/auth/callback");
  }

  if (
    normalizedSearchParams.has("token_hash") ||
    normalizedSearchParams.has("type")
  ) {
    const queryString = normalizedSearchParams.toString();
    redirect(queryString ? `/verify?${queryString}` : "/verify");
  }

  return (
    <main>
      <StructuredData data={buildOrganizationSchema()} />
      <StructuredData data={buildWebSiteSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Frithly gives agencies, founders, and outbound teams a weekly brief of higher-intent prospects, verified contacts, live signals, and outreach angles built for better reply rates.",
          path: "/",
          title: "Frithly | Smaller Lists. Better Timing. Stronger Replies.",
        })}
      />
      <StructuredData data={buildServiceSchema()} />
      <StructuredData data={buildFaqSchema(platformFaqs)} />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="landing-page-viewed"
        properties={{ location: "home_page" }}
      />
      <PlatformHomepage />
    </main>
  );
}
