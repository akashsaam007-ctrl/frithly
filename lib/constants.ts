import { publicEnv } from "@/lib/utils/public-env";

export const APP_NAME = "Frithly";
export const APP_TAGLINE =
  "Curated outbound intelligence delivered weekly for teams that want better-fit opportunities, founder-aware targeting, and SMTP-safe execution.";
export const APP_DOMAIN = "frithly.com";
export const CALCOM_URL = publicEnv.NEXT_PUBLIC_CALCOM_URL;
export const SUPPORT_EMAIL = "hello@frithly.com";
export const BUSINESS_ADDRESS =
  "55, Peranayakanvalasu, Dharapuram, Tiruppur, Mulanur, Tamil Nadu, India - 638106";

export const PLANS = {
  DESIGN_PARTNER: {
    badge: "First 3 Customers Only",
    currency: "GBP",
    features: [
      "1 active outbound delivery pipeline",
      "Selective opportunity queue",
      "Source-backed draft generation",
      "Human-gated SMTP review",
      "CRM and CSV exports",
      "Locked-in for life",
    ],
    id: "design_partner",
    interval: "month",
    name: "Design Partner",
    price: 199,
    spotsTotal: 3,
  },
  GROWTH: {
    badge: "Most Popular",
    currency: "GBP",
    features: [
      "Multi-city delivery orchestration",
      "Expanded opportunity coverage",
      "Draft review and cohort packaging",
      "Analytics and outcome learning",
      "Bi-weekly ICP refinement calls",
      "Slack/email support",
    ],
    id: "growth",
    interval: "month",
    isHighlighted: true,
    name: "Growth",
    price: 999,
  },
  SCALE: {
    currency: "GBP",
    features: [
      "Multi-ICP delivery support",
      "Advanced opportunity routing",
      "Premium cohort operations",
      "Custom export and CRM workflows",
      "Priority intelligence tuning",
      "Weekly strategy call",
      "Priority support",
    ],
    id: "scale",
    interval: "month",
    name: "Scale",
    price: 1999,
  },
  STARTER: {
    currency: "GBP",
    features: [
      "1 active outbound delivery pipeline",
      "Recommendation-first opportunity review",
      "Draft workspace and export packaging",
      "SMTP-safe routing review",
      "Email support",
    ],
    id: "starter",
    interval: "month",
    name: "Starter",
    price: 499,
  },
} as const;

export const COLORS = {
  accent: "#D4623A",
  accentDark: "#B14E2A",
  background: "#FAF8F5",
  border: "#E8E4DD",
  cardBg: "#FFFFFF",
  error: "#EF4444",
  success: "#10B981",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
} as const;

export const ROUTES = {
  ABOUT: "/about",
  ACCOUNT: "/account",
  ADMIN: "/admin",
  ADMIN_APPLICATIONS: "/admin/applications",
  ADMIN_BATCHES_NEW: "/admin/batches/new",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_DELIVERIES: "/admin/deliveries",
  ADMIN_FEEDBACK: "/admin/feedback",
  ADMIN_LEAD_STUDIO: "/admin/lead-studio",
  ANALYTICS: "/analytics",
  APPLY: "/apply",
  BILLING: "/billing",
  BRIEFS: "/briefs",
  CAMPAIGNS: "/campaigns",
  COHORTS: "/cohorts",
  BOOK_MEETING: CALCOM_URL,
  CONTACT: "/contact",
  CONTACT_SALES: "/contact#sales-form",
  DASHBOARD: "/dashboard",
  DEMO: "/demo",
  DRAFTS: "/drafts",
  EXPORTS: "/exports",
  FAQ: "/#faq",
  GUIDES: "/guides",
  HELP: "/help",
  HOME: "/",
  HOW_IT_WORKS: "/#living-engine",
  ICP: "/icp",
  LOGIN: "/login",
  PRICING: "/#program-builder",
  PRIVACY: "/privacy",
  PROOF: "/proof",
  REFUND_POLICY: "/refund-policy",
  RECOMMENDATIONS: "/recommendations",
  ROI: "/roi",
  SAMPLE: "/sample",
  SIGNUP: "/signup",
  SMTP: "/smtp",
  TERMS: "/terms",
} as const;

export const META = {
  DESCRIPTION:
    "Frithly is a premium curated outbound intelligence service for agencies and outbound teams. We deliver reviewed weekly opportunity cohorts with founder-aware targeting, SMTP-safe routing, and outreach-ready context.",
  KEYWORDS:
    "curated outbound intelligence, outbound opportunity delivery, weekly outbound cohorts, founder-aware targeting, SMTP-safe routing, reviewed B2B opportunities, outbound research service",
  TITLE: "Frithly | Curated Outbound Intelligence Delivered Weekly",
} as const;
