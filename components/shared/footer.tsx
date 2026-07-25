import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import { Container } from "@/components/ui/container";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function FooterWordmark() {
  return (
    <Link className="inline-flex items-center gap-3 text-[#f3f1ea]" href={ROUTES.HOME}>
      <span className="h-2 w-2 rounded-[2px] bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)]" />
      <span className={cn(displayFont.className, "text-[1.35rem] font-bold tracking-[-0.02em]")}>
        Frithly
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className={cn(bodyFont.className, "border-t border-[#1e2227] bg-[#0c0e11] py-12 text-[#f3f1ea]")}>
      <Container className="max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <FooterWordmark />
            <p className="mt-5 max-w-md text-[14px] leading-[1.7] text-[#9ba1a8]">
              Signal-qualified outbound opportunities for teams that want better timing, verified
              decision-makers, and outreach built around a real reason to buy.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f3f1ea]">Experience</h3>
              <div className="mt-4 grid gap-3 text-[13px] text-[#9ba1a8]">
                <Link className="transition-colors hover:text-[#f3f1ea]" href="/#process">
                  Process
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href="/#receive">
                  What you receive
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href="/#sample-opportunity">
                  Sample opportunity
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href="/#faq">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-semibold text-[#f3f1ea]">Legal</h3>
              <div className="mt-4 grid gap-3 text-[13px] text-[#9ba1a8] sm:grid-cols-2">
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.PRIVACY}>
                  Privacy
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.REFUND_POLICY}>
                  Refund
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.TERMS}>
                  Terms
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.GDPR_POLICY}>
                  GDPR
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.COOKIE_POLICY}>
                  Cookie
                </Link>
                <Link className="transition-colors hover:text-[#f3f1ea]" href={ROUTES.ACCEPTABLE_USE_POLICY}>
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
    </footer>
  );
}
