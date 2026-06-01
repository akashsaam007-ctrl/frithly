import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#050c14",
    categories: ["business", "productivity", "sales", "marketing"],
    description: APP_TAGLINE,
    dir: "ltr",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icon-512.png",
        type: "image/png",
      },
    ],
    lang: "en-GB",
    name: APP_NAME,
    orientation: "portrait",
    short_name: APP_NAME,
    scope: "/",
    start_url: "/",
    theme_color: "#050c14",
  };
}
