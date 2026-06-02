import type { Metadata } from "next";
import { APP_DOMAIN, APP_NAME, APP_TAGLINE, BOOKING_URL, META, SUPPORT_EMAIL } from "@/lib/constants";
import { publicEnv } from "@/lib/utils/public-env";

const SITE_URL = publicEnv.NEXT_PUBLIC_APP_URL || `https://${APP_DOMAIN}`;
const DEFAULT_LOCALE = "en_GB";
const DEFAULT_IMAGE = "/og-image.png";
const DEFAULT_LOGO = "/frithly-logo.png";
const ORG_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");
const SERVICE_ID = absoluteUrl("/#service");
const SITE_LAST_MODIFIED = "2026-06-02T00:00:00.000Z";
const PRIMARY_MARKETS = ["United States", "Canada", "United Kingdom", "Europe"] as const;
const SITE_NAV_ITEMS = [
  { name: "Home", path: "/" },
  { name: "Apply", path: "/apply" },
  { name: "Contact", path: "/contact" },
  { name: "Pricing", path: "/pricing" },
  { name: "About", path: "/about" },
  { name: "Guides", path: "/guides" },
  { name: "Proof", path: "/proof" },
  { name: "Demo", path: "/demo" },
] as const;

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
    applicationName: APP_NAME,
    alternates: {
      canonical,
    },
    authors: [{ name: APP_NAME }],
    category: "Outbound targeting and research service",
    classification: "B2B outbound research and targeting service",
    creator: APP_NAME,
    description,
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    keywords,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      description,
      images: [
        {
          alt: `${APP_NAME} | Better outbound starts with better accounts`,
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
    publisher: APP_NAME,
    referrer: "origin-when-cross-origin",
    robots: noIndex
      ? {
          follow: false,
          googleBot: {
            follow: false,
            index: false,
            noimageindex: true,
          },
          index: false,
        }
      : {
          follow: true,
          googleBot: {
            follow: true,
            index: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
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
    "@id": ORG_ID,
    areaServed: [...PRIMARY_MARKETS],
    brand: {
      "@type": "Brand",
      description: META.DESCRIPTION,
      image: absoluteUrl(DEFAULT_IMAGE),
      logo: absoluteUrl(DEFAULT_LOGO),
      name: APP_NAME,
      slogan: APP_TAGLINE,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        areaServed: [...PRIMARY_MARKETS],
        contactType: "sales",
        email: SUPPORT_EMAIL,
        availableLanguage: ["en"],
        url: BOOKING_URL,
      },
      {
        "@type": "ContactPoint",
        areaServed: [...PRIMARY_MARKETS],
        contactType: "customer support",
        email: SUPPORT_EMAIL,
        availableLanguage: ["en"],
        url: absoluteUrl("/contact"),
      },
    ],
    description: META.DESCRIPTION,
    email: SUPPORT_EMAIL,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Frithly outbound research programs",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Starter",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Growth",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Scale",
          },
        },
      ],
    },
    image: absoluteUrl(DEFAULT_LOGO),
    knowsAbout: [
      "outbound targeting",
      "B2B prospect research",
      "account research",
      "safer outreach",
      "sales prospect research",
      "weekly outbound research briefs",
    ],
    legalName: APP_NAME,
    logo: absoluteUrl(DEFAULT_LOGO),
    name: APP_NAME,
    slogan: APP_TAGLINE,
    url: absoluteUrl("/"),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    about: [
      "Better outbound targeting",
      "Weekly account research",
      "Better-fit accounts",
      "Safer outreach",
    ],
    alternateName: "Frithly outbound research",
    description: META.DESCRIPTION,
    image: absoluteUrl(DEFAULT_LOGO),
    inLanguage: "en-GB",
    keywords: META.KEYWORDS,
    name: APP_NAME,
    potentialAction: [
      {
        "@type": "CommunicateAction",
        name: "Apply for a targeting review",
        target: absoluteUrl("/apply"),
      },
      {
        "@type": "ScheduleAction",
        name: "Book an outbound intelligence review",
        target: BOOKING_URL,
      },
    ],
    publisher: {
      "@id": ORG_ID,
    },
    url: absoluteUrl("/"),
  };
}

export function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": SERVICE_ID,
    areaServed: [...PRIMARY_MARKETS],
    audience: {
      "@type": "Audience",
      audienceType: "Founders, CEOs, revenue leaders, SDR teams, agencies, and GTM operators",
    },
    category: "Outbound targeting and research service",
    description:
      "A premium outbound research service for teams that want better-fit accounts, better timing, and safer outreach before campaigns start.",
    image: absoluteUrl(DEFAULT_LOGO),
    name: `${APP_NAME} outbound targeting service`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      category: "B2B service",
      description:
        "Custom outbound research programs built around ICP, geography, timing, deliverability, and weekly delivery.",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 499,
        priceCurrency: "GBP",
      },
      url: absoluteUrl("/apply"),
    },
    provider: {
      "@id": ORG_ID,
    },
    serviceOutput:
      "Weekly briefs with better-fit accounts, the right contacts, clear timing context, and stronger outreach angles.",
    serviceType: "Outbound targeting and research service",
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
    "@id": `${absoluteUrl(path)}#webpage`,
    about: {
      "@id": SERVICE_ID,
    },
    description,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    primaryImageOfPage: absoluteUrl(DEFAULT_IMAGE),
    name: title,
    url: absoluteUrl(path),
  };
}

export function buildContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    about: {
      "@id": ORG_ID,
    },
    description:
      "Contact Frithly for outbound research programs, onboarding, scheduling, and support.",
    inLanguage: "en-GB",
    name: "Contact Frithly",
    url: absoluteUrl("/contact"),
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
    "@id": `${absoluteUrl(path)}#article`,
    author: {
      "@id": ORG_ID,
    },
    description,
    dateModified: SITE_LAST_MODIFIED,
    datePublished: SITE_LAST_MODIFIED,
    headline: title,
    image: absoluteUrl(DEFAULT_IMAGE),
    inLanguage: "en-GB",
    mainEntityOfPage: absoluteUrl(path),
    publisher: {
      "@id": ORG_ID,
    },
    about: {
      "@id": SERVICE_ID,
    },
  };
}

export function buildCollectionPageSchema({
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
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#collection`,
    about: {
      "@id": SERVICE_ID,
    },
    description,
    inLanguage: "en-GB",
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    name: title,
    primaryImageOfPage: absoluteUrl(DEFAULT_IMAGE),
    url: absoluteUrl(path),
  };
}

export function buildSiteNavigationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SITE_NAV_ITEMS.map((item, index) => ({
      "@type": "SiteNavigationElement",
      name: item.name,
      position: index + 1,
      url: absoluteUrl(item.path),
    })),
  };
}
