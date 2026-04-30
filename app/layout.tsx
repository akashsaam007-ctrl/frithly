import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { Toaster } from "@/components/ui/toast";
import { APP_NAME, META } from "@/lib/constants";
import { publicEnv } from "@/lib/utils/public-env";
import "@/app/globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  category: "B2B SaaS",
  creator: APP_NAME,
  description: META.DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { sizes: "192x192", type: "image/png", url: "/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icon-512.png" },
    ],
    shortcut: "/favicon.ico",
  },
  keywords: META.KEYWORDS.split(", "),
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  publisher: APP_NAME,
  title: META.TITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
        <PostHogProvider />
        <Toaster />
      </body>
    </html>
  );
}
