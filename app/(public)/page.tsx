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
  buildSiteNavigationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Frithly is signal-based outbound intelligence infrastructure that improves targeting precision, deliverability safety, and pipeline relevance before campaigns deploy.",
  keywords: [
    "outbound intelligence infrastructure",
    "signal based outbound intelligence",
    "deliverability safe targeting",
    "commercial relevance infrastructure",
    "premium outbound intelligence",
    "weekly intelligence brief",
  ],
  path: "/",
  title: "Frithly | Signal-Based Outbound Intelligence Infrastructure",
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
      <StructuredData data={buildSiteNavigationSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Frithly gives agencies, founders, and outbound teams signal-qualified accounts, route-safe targeting, and a weekly intelligence brief built for better commercial relevance.",
          path: "/",
          title: "Frithly | Signal-Based Outbound Intelligence Infrastructure",
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
