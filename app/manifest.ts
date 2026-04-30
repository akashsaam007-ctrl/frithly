import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#FAF8F5",
    description: APP_TAGLINE,
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
    name: APP_NAME,
    short_name: APP_NAME,
    start_url: "/",
    theme_color: "#FAF8F5",
  };
}
