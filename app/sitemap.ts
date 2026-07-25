import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const SITE_LAST_MODIFIED = new Date("2026-06-02T00:00:00.000Z");

const staticRoutes = [
  { changeFrequency: "weekly" as const, path: "/", priority: 1 },
  { changeFrequency: "weekly" as const, path: "/book-call", priority: 0.86 },
  { changeFrequency: "monthly" as const, path: "/guides", priority: 0.82 },
  { changeFrequency: "weekly" as const, path: "/sample", priority: 0.88 },
  { changeFrequency: "yearly" as const, path: "/privacy", priority: 0.35 },
  { changeFrequency: "yearly" as const, path: "/terms", priority: 0.35 },
  { changeFrequency: "yearly" as const, path: "/refund-policy", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/gdpr", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/cookie-policy", priority: 0.32 },
  { changeFrequency: "yearly" as const, path: "/acceptable-use-policy", priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: SITE_LAST_MODIFIED,
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
