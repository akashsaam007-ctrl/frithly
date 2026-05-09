import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageEvent } from "@/components/analytics/page-event";
import { PlatformHomepage, platformFaqs } from "@/components/landing/platform-homepage";
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
    "Frithly is a confidence-aware outbound intelligence platform that turns client ICPs into selective delivery pipelines, ranked opportunities, source-backed drafts, SMTP-safe cohorts, and outcome-driven learning.",
  keywords: [
    "outbound intelligence platform",
    "curated outbound opportunities",
    "founder contact intelligence",
    "SMTP-safe outbound workflow",
    "B2B recommendation engine",
    "outbound operations software",
  ],
  path: "/",
  title: "Frithly | Confidence-Aware Outbound Intelligence Platform",
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
            "Frithly helps outbound teams turn ICPs into selective delivery pipelines, ranked recommendations, safe contact validation, and deployment-ready outbound cohorts.",
          path: "/",
          title: "Frithly | Confidence-Aware Outbound Intelligence Platform",
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
