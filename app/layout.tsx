import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  description: META.DESCRIPTION,
  keywords: META.KEYWORDS.split(", "),
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
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
        <Toaster />
      </body>
    </html>
  );
}
