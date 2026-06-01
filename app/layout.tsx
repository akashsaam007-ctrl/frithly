import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { Toaster } from "@/components/ui/toast";
import { APP_DOMAIN, APP_NAME, META } from "@/lib/constants";
import { publicEnv } from "@/lib/utils/public-env";
import "@/app/globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  alternates: {
    canonical: "/",
  },
  category: "B2B outbound intelligence infrastructure",
  classification: "Signal-based outbound intelligence infrastructure",
  creator: APP_NAME,
  description: META.DESCRIPTION,
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: [{ sizes: "180x180", type: "image/png", url: "/apple-touch-icon.png" }],
    icon: [
      { sizes: "any", url: "/favicon.ico" },
      { sizes: "48x48", type: "image/png", url: "/favicon-48x48.png" },
      { sizes: "192x192", type: "image/png", url: "/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icon-512.png" },
    ],
    shortcut: "/favicon.ico",
  },
  keywords: META.KEYWORDS.split(", "),
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL || `https://${APP_DOMAIN}`),
  openGraph: {
    description: META.DESCRIPTION,
    images: [
      {
        height: 630,
        url: "/og-image.png",
        width: 1200,
      },
    ],
    locale: "en_GB",
    siteName: APP_NAME,
    title: META.TITLE,
    type: "website",
    url: "/",
  },
  publisher: APP_NAME,
  referrer: "origin-when-cross-origin",
  robots: {
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
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  twitter: {
    card: "summary_large_image",
    description: META.DESCRIPTION,
    images: ["/og-image.png"],
    title: META.TITLE,
  },
  title: META.TITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={inter.variable}>
        {children}
        <PostHogProvider />
        <Toaster />
      </body>
    </html>
  );
}
