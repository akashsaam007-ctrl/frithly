import { CookieBanner } from "@/components/shared/cookie-banner";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-[#050c14] text-[#fff7f1]">
      <Navbar />
      {children}
      <Footer />
      <CookieBanner />
    </div>
  );
}
