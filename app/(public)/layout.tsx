import { CookieBanner } from "@/components/shared/cookie-banner";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-[#0c0e11] pt-[58px] text-[#f3f1ea] sm:pt-[66px]">
      <Navbar />
      {children}
      <Footer />
      <CookieBanner />
    </div>
  );
}
