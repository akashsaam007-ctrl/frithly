import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { changeFrequency: "weekly" as const, path: "/", priority: 1 },
    { changeFrequency: "monthly" as const, path: "/about", priority: 0.7 },
    { changeFrequency: "weekly" as const, path: "/guides", priority: 0.8 },
    { changeFrequency: "weekly" as const, path: "/proof", priority: 0.8 },
    { changeFrequency: "weekly" as const, path: "/pricing", priority: 0.9 },
    { changeFrequency: "weekly" as const, path: "/sample", priority: 0.9 },
    { changeFrequency: "weekly" as const, path: "/b2b-lead-intelligence", priority: 0.8 },
    { changeFrequency: "weekly" as const, path: "/apollo-alternative-for-founders", priority: 0.8 },
    {
      changeFrequency: "weekly" as const,
      path: "/weekly-sales-prospect-research-service",
      priority: 0.8,
    },
    {
      changeFrequency: "weekly" as const,
      path: "/personalized-outbound-lead-research",
      priority: 0.8,
    },
    {
      changeFrequency: "weekly" as const,
      path: "/sales-intelligence-for-early-stage-saas",
      priority: 0.8,
    },
    {
      changeFrequency: "weekly" as const,
      path: "/proof/founder-led-outbound-case-study",
      priority: 0.8,
    },
    {
      changeFrequency: "weekly" as const,
      path: "/proof/small-sdr-team-outbound-case-study",
      priority: 0.8,
    },
    {
      changeFrequency: "weekly" as const,
      path: "/proof/weekly-research-brief-case-study",
      priority: 0.8,
    },
    { changeFrequency: "monthly" as const, path: "/privacy", priority: 0.5 },
    { changeFrequency: "monthly" as const, path: "/terms", priority: 0.5 },
    { changeFrequency: "monthly" as const, path: "/refund-policy", priority: 0.5 },
  ];

  return routes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified: new Date(),
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
