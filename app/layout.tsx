import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME, META } from "@/lib/constants";
import { env } from "@/lib/utils/env";
import "@/app/globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  description: META.DESCRIPTION,
  keywords: META.KEYWORDS.split(", "),
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: META.TITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
