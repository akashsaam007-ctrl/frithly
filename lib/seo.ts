import type { Metadata } from "next";
import {
  APP_DOMAIN,
  APP_LOCATION,
  APP_NAME,
  APP_TAGLINE,
  META,
  PLANS,
  SUPPORT_EMAIL,
} from "@/lib/constants";
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
    address: {
      "@type": "PostalAddress",
      addressCountry: "GB",
      addressLocality: APP_LOCATION,
    },
    description: META.DESCRIPTION,
    email: SUPPORT_EMAIL,
    knowsAbout: [
      "B2B lead generation",
      "sales intelligence",
      "outbound prospecting",
      "lead research",
      "personalized outreach",
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
    areaServed: "Worldwide",
    audience: {
      "@type": "Audience",
      audienceType: "B2B sales teams, founders, SDR teams, and GTM operators",
    },
    category: "B2B lead intelligence",
    description:
      "Weekly B2B lead intelligence delivered as researched accounts, verified contacts, and personalized opening angles for outbound teams.",
    name: `${APP_NAME} B2B lead intelligence`,
    offers: [PLANS.STARTER, PLANS.GROWTH, PLANS.SCALE].map((plan) => ({
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      category: "Recurring subscription",
      description: `${plan.name} plan for ${APP_NAME} lead intelligence`,
      name: plan.name,
      price: plan.price,
      priceCurrency: plan.currency,
      url: absoluteUrl("/pricing"),
    })),
    provider: {
      "@id": absoluteUrl("/#organization"),
    },
    serviceOutput:
      "A weekly outbound brief with researched leads, verified contacts, timing context, and message angles.",
    serviceType: "B2B lead intelligence service",
    slogan: APP_TAGLINE,
    url: absoluteUrl("/pricing"),
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
