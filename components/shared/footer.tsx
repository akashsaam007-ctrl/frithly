import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
});

const footerLinkClass =
  "text-[#9ba1a8] transition-colors hover:text-[#e7a6d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a6d6]/40";

export function Footer() {
  return (
    <footer className={cn(bodyFont.className, "relative overflow-hidden border-t border-[#262b31] bg-[#0c0e11] text-[#f3f1ea]")}>
      <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_0%,rgba(238,159,203,0.1),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(182,171,232,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.06]" />
      <div className="relative py-12">
      <Container className="max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <Logo imageClassName="h-7" />
            <p className="mt-5 max-w-md text-[14px] leading-[1.7] text-[#9ba1a8]">
              Signal-qualified outbound opportunities for teams that want better timing, verified
              decision-makers, and outreach built around a real reason to buy.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
                Experience
              </h3>
              <div className="mt-4 grid gap-3 text-[13px] text-[#9ba1a8]">
                <Link className={footerLinkClass} href="/#process">
                  Process
                </Link>
                <Link className={footerLinkClass} href="/#receive">
                  What you receive
                </Link>
                <Link className={footerLinkClass} href="/#sample-opportunity">
                  Sample opportunity
                </Link>
                <Link className={footerLinkClass} href={ROUTES.GUIDES}>
                  Free guide
                </Link>
                <Link className={footerLinkClass} href="/#faq">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
                Legal
              </h3>
              <div className="mt-4 grid gap-3 text-[13px] text-[#9ba1a8] sm:grid-cols-2">
                <Link className={footerLinkClass} href={ROUTES.PRIVACY}>
                  Privacy
                </Link>
                <Link className={footerLinkClass} href={ROUTES.REFUND_POLICY}>
                  Refund
                </Link>
                <Link className={footerLinkClass} href={ROUTES.TERMS}>
                  Terms
                </Link>
                <Link className={footerLinkClass} href={ROUTES.GDPR_POLICY}>
                  GDPR
                </Link>
                <Link className={footerLinkClass} href={ROUTES.COOKIE_POLICY}>
                  Cookie
                </Link>
                <Link className={footerLinkClass} href={ROUTES.ACCEPTABLE_USE_POLICY}>
                  Acceptable Use
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#1e2227] pt-5 text-[13px] text-[#5c636b] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 {APP_NAME}. All rights reserved.</p>
          <p>{SUPPORT_EMAIL}</p>
        </div>
      </Container>
      </div>
    </footer>
  );
}
