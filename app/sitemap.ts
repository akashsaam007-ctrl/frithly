import type { MetadataRoute } from "next";
import { intentGuides } from "@/lib/intent-guides";
import { proofPages } from "@/lib/proof-pages";
import { absoluteUrl } from "@/lib/seo";

const SITE_LAST_MODIFIED = new Date("2026-06-02T00:00:00.000Z");

const staticRoutes = [
  { changeFrequency: "weekly" as const, path: "/", priority: 1 },
  { changeFrequency: "monthly" as const, path: "/about", priority: 0.72 },
  { changeFrequency: "weekly" as const, path: "/apply", priority: 0.88 },
  { changeFrequency: "monthly" as const, path: "/contact", priority: 0.78 },
  { changeFrequency: "weekly" as const, path: "/demo", priority: 0.8 },
  { changeFrequency: "monthly" as const, path: "/guides", priority: 0.82 },
  { changeFrequency: "monthly" as const, path: "/pricing", priority: 0.9 },
  { changeFrequency: "monthly" as const, path: "/proof", priority: 0.8 },
  { changeFrequency: "weekly" as const, path: "/roi", priority: 0.7 },
  { changeFrequency: "yearly" as const, path: "/privacy", priority: 0.35 },
  { changeFrequency: "yearly" as const, path: "/terms", priority: 0.35 },
  { changeFrequency: "yearly" as const, path: "/refund-policy", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/gdpr", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/cookie-policy", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/acceptable-use-policy", priority: 0.3 },
  { changeFrequency: "yearly" as const, path: "/disclaimer", priority: 0.28 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes = intentGuides.map((guide) => ({
    changeFrequency: "monthly" as const,
    path: `/${guide.slug}`,
    priority: 0.76,
  }));

  const proofRoutes = proofPages.map((page) => ({
    changeFrequency: "monthly" as const,
    path: `/proof/${page.slug}`,
    priority: 0.74,
  }));

  return [...staticRoutes, ...guideRoutes, ...proofRoutes].map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: SITE_LAST_MODIFIED,
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
