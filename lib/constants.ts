import { publicEnv } from "@/lib/utils/public-env";

export const APP_NAME = "Frithly";
export const APP_TAGLINE = "50 hyper-researched B2B leads. Every Monday.";
export const APP_DOMAIN = "frithly.com";
export const APP_LOCATION = "London";
export const CALCOM_URL = publicEnv.NEXT_PUBLIC_CALCOM_URL;
export const SUPPORT_EMAIL = "hi@frithly.com";

export const PLANS = {
  DESIGN_PARTNER: {
    badge: "First 3 Customers Only",
    currency: "GBP",
    features: [
      "50 leads per week",
      "Basic research",
      "1 personalized opener per lead",
      "Monday delivery",
      "Email support",
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
      "100 leads per week",
      "Deep research",
      "3 openers per lead (situational, content, company)",
      "Wednesday mid-week refresh",
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
      "200 leads per week",
      "Multi-ICP support",
      "Multi-channel openers",
      "CRM integration",
      "Intent data signals",
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
      "50 leads per week",
      "Basic research",
      "1 personalized opener per lead",
      "Monday delivery",
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
  ADMIN: "/admin",
  ADMIN_BATCHES_NEW: "/admin/batches/new",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_FEEDBACK: "/admin/feedback",
  BILLING: "/billing",
  BRIEFS: "/briefs",
  DASHBOARD: "/dashboard",
  FAQ: "/#faq",
  HELP: "/help",
  HOME: "/",
  HOW_IT_WORKS: "/#how-it-works",
  ICP: "/icp",
  LOGIN: "/login",
  PRICING: "/#pricing",
  PRIVACY: "/privacy",
  REFUND_POLICY: "/refund-policy",
  SAMPLE: "/sample",
  SIGNUP: "/signup",
  TERMS: "/terms",
} as const;

export const META = {
  DESCRIPTION:
    "Frithly delivers 50 deeply-researched B2B leads with personalized opening lines to your inbox every Monday morning. Apollo gives you data. We deliver intelligence.",
  KEYWORDS:
    "B2B lead generation, sales intelligence, personalized outreach, lead research, sales automation",
  TITLE: "Frithly - 50 Hyper-Researched B2B Leads, Every Monday",
} as const;
