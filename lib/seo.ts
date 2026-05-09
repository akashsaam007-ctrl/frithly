import type { Metadata } from "next";
import { APP_DOMAIN, APP_NAME, APP_TAGLINE, META, SUPPORT_EMAIL } from "@/lib/constants";
import { publicEnv } from "@/lib/utils/public-env";

const SITE_URL = publicEnv.NEXT_PUBLIC_APP_URL || `https://${APP_DOMAIN}`;
const DEFAULT_LOCALE = "en_GB";
const DEFAULT_IMAGE = "/og-image.png";

type PublicMetadataOptions = {
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  path: string;
  title: string;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  answer: string;
  question: string;
};

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function absoluteUrl(path = "/") {
  return new URL(normalizePath(path), SITE_URL).toString();
}

export function buildPublicMetadata({
  description,
  keywords = META.KEYWORDS.split(", "),
  noIndex = false,
  path,
  title,
}: PublicMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);

  return {
    alternates: {
      canonical,
    },
    description,
    keywords,
    openGraph: {
      description,
      images: [
        {
          height: 630,
          url: absoluteUrl(DEFAULT_IMAGE),
          width: 1200,
        },
      ],
      locale: DEFAULT_LOCALE,
      siteName: APP_NAME,
      title,
      type: "website",
      url: canonical,
    },
    robots: noIndex
      ? {
          follow: false,
          index: false,
        }
      : {
          follow: true,
          index: true,
        },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [absoluteUrl(DEFAULT_IMAGE)],
      title,
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    description: META.DESCRIPTION,
    email: SUPPORT_EMAIL,
    knowsAbout: [
      "curated outbound intelligence",
      "B2B prospect research",
      "founder-aware targeting",
      "SMTP-safe outreach planning",
      "weekly outbound delivery",
    ],
    logo: absoluteUrl("/icon-512.png"),
    name: APP_NAME,
    url: absoluteUrl("/"),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    description: META.DESCRIPTION,
    inLanguage: "en-GB",
    name: APP_NAME,
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
    url: absoluteUrl("/"),
  };
}

export function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/#service"),
    areaServed: ["United Kingdom", "Europe", "United States"],
    audience: {
      "@type": "Audience",
      audienceType: "Agencies, founders, SDR teams, and outbound operators",
    },
    category: "Premium outbound intelligence service",
    description:
      "Confidence-aware outbound intelligence for teams that want reviewed weekly opportunities, founder-aware targeting, SMTP-aware routing, and stronger delivery discipline.",
    name: `${APP_NAME} curated outbound intelligence service`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      category: "Consultative service",
      description:
        "Custom outbound intelligence programs tailored around ICP, geography, targeting depth, and weekly delivery cadence.",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 499,
        priceCurrency: "EUR",
      },
      url: absoluteUrl("/apply"),
    },
    provider: {
      "@id": absoluteUrl("/#organization"),
    },
    serviceOutput:
      "Reviewed weekly opportunity cohorts with founder context, routing notes, recommendation reasoning, and outreach-ready delivery context.",
    serviceType: "Curated weekly outbound opportunity delivery",
    slogan: APP_TAGLINE,
    url: absoluteUrl("/"),
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function buildWebPageSchema({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    description,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    name: title,
    url: absoluteUrl(path),
  };
}

export function buildArticleSchema({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@id": absoluteUrl("/#organization"),
    },
    description,
    headline: title,
    mainEntityOfPage: absoluteUrl(path),
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}
