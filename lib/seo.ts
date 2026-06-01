import type { Metadata } from "next";
import { APP_DOMAIN, APP_NAME, APP_TAGLINE, META, SUPPORT_EMAIL } from "@/lib/constants";
import { publicEnv } from "@/lib/utils/public-env";

const SITE_URL = publicEnv.NEXT_PUBLIC_APP_URL || `https://${APP_DOMAIN}`;
const DEFAULT_LOCALE = "en_GB";
const DEFAULT_IMAGE = "/og-image.png";
const ORG_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");
const SERVICE_ID = absoluteUrl("/#service");
const SITE_LAST_MODIFIED = "2026-06-01T00:00:00.000Z";
const PRIMARY_MARKETS = ["United States", "Canada", "United Kingdom", "Europe"] as const;
const SITE_NAV_ITEMS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Pricing", path: "/pricing" },
  { name: "Apply", path: "/apply" },
  { name: "Contact", path: "/contact" },
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
    category: "B2B outbound intelligence infrastructure",
    classification: "Signal-based outbound intelligence infrastructure",
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
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Dharapuram",
      addressRegion: "Tamil Nadu",
      postalCode: "638106",
      streetAddress: "55, Peranayakanvalasu, Mulanur",
    },
    areaServed: [...PRIMARY_MARKETS],
    brand: {
      "@type": "Brand",
      description: META.DESCRIPTION,
      image: absoluteUrl(DEFAULT_IMAGE),
      logo: absoluteUrl("/icon-512.png"),
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
        url: absoluteUrl("/contact"),
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
      name: "Frithly outbound intelligence programs",
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
    image: absoluteUrl(DEFAULT_IMAGE),
    knowsAbout: [
      "signal-based outbound intelligence",
      "outbound intelligence infrastructure",
      "B2B prospect research",
      "founder-aware targeting",
      "deliverability-safe outreach planning",
      "weekly outbound intelligence delivery",
    ],
    legalName: APP_NAME,
    logo: absoluteUrl("/icon-512.png"),
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
      "Curated outbound intelligence",
      "Weekly opportunity delivery",
      "Founder-aware targeting",
      "SMTP-safe routing",
    ],
    alternateName: "Frithly outbound intelligence",
    description: META.DESCRIPTION,
    inLanguage: "en-GB",
    keywords: META.KEYWORDS,
    name: APP_NAME,
    potentialAction: {
      "@type": "CommunicateAction",
      name: "Apply for outbound intelligence audit",
      target: absoluteUrl("/apply"),
    },
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
    category: "Signal-based outbound intelligence infrastructure",
    description:
      "Signal-based outbound intelligence infrastructure for teams that want reviewed weekly opportunities, founder-aware targeting, deliverability-safe routing, and stronger commercial relevance before campaigns deploy.",
    name: `${APP_NAME} signal-based outbound intelligence infrastructure`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      category: "B2B service",
      description:
        "Custom outbound intelligence programs tailored around ICP, geography, qualification depth, deliverability safety, and weekly release cadence.",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 499,
        priceCurrency: "GBP",
      },
      url: absoluteUrl("/contact"),
    },
    provider: {
      "@id": ORG_ID,
    },
    serviceOutput:
      "Reviewed weekly outbound intelligence briefs with account fit, signal context, route notes, and outreach-ready decision-maker reasoning.",
    serviceType: "Outbound intelligence infrastructure",
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
      "Contact Frithly for curated outbound intelligence programs, onboarding, scheduling, and support.",
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
