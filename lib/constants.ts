import { publicEnv } from "@/lib/utils/public-env";

export const APP_NAME = "Frithly";
export const APP_TAGLINE =
  "Better-fit accounts, better timing, and safer outbound before the first email is sent.";
export const APP_DOMAIN = "frithly.com";
export const CALENDLY_URL = publicEnv.NEXT_PUBLIC_CALENDLY_URL;
export const CALCOM_URL = publicEnv.NEXT_PUBLIC_CALCOM_URL;
export const DEFAULT_CALENDLY_URL =
  "https://calendly.com/akashmanoharan-frithly/frithly-outbound-intelligence-review";
export const BOOKING_URL = CALENDLY_URL ?? DEFAULT_CALENDLY_URL;
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
  ACCEPTABLE_USE_POLICY: "/acceptable-use-policy",
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
  BOOK_MEETING: BOOKING_URL,
  CONTACT: "/contact",
  CONTACT_SALES: "/contact#sales-form",
  COOKIE_POLICY: "/cookie-policy",
  DASHBOARD: "/dashboard",
  DEMO: "/demo",
  DISCLAIMER: "/disclaimer",
  DRAFTS: "/drafts",
  EXPORTS: "/exports",
  FAQ: "/#faq",
  GDPR_POLICY: "/gdpr",
  GUIDES: "/guides",
  HELP: "/help",
  HOME: "/",
  HOW_IT_WORKS: "/#pipeline",
  ICP: "/icp",
  LOGIN: "/login",
  PRICING: "/#application",
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
    "Frithly helps outbound teams stop wasting outreach on the wrong accounts with better-fit companies, the right contacts, and better timing before the first email.",
  KEYWORDS:
    "Frithly, outbound targeting service, better fit accounts, B2B prospect research, weekly outbound research brief, deliverability safe outreach, founder outbound support",
  TITLE: "Frithly | Better Outbound Starts With Better Accounts",
} as const;
