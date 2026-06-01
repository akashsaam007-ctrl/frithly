import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: absoluteUrl("/"),
    rules: [
      {
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/auth",
          "/billing",
          "/briefs",
          "/checkout",
          "/dashboard",
          "/help",
          "/icp",
          "/login",
          "/pay",
          "/signup",
          "/verify",
        ],
        userAgent: "*",
      },
      {
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/auth",
          "/billing",
          "/briefs",
          "/checkout",
          "/dashboard",
          "/help",
          "/icp",
          "/login",
          "/pay",
          "/signup",
          "/verify",
        ],
        userAgent: "Googlebot",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
