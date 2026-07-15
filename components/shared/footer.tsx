import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[linear-gradient(180deg,#080808_0%,#040404_100%)] py-12 text-white sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_center,rgba(201,183,255,0.08),transparent_72%)] blur-3xl" />
      <Container className="relative space-y-8 sm:space-y-10">
        <div className="grid gap-8 sm:gap-10 xl:grid-cols-[0.95fr_2.05fr]">
          <div className="space-y-4">
            <Logo
              className="w-fit hover:opacity-100"
              imageClassName="h-8 sm:h-9 md:h-10"
            />
            <p className="max-w-sm text-base leading-8 text-white/68">
              Frithly identifies buying signals, manually qualifies companies, verifies
              decision-makers, and delivers outbound-ready opportunities your team can act on
              immediately.
            </p>
            <div className="max-w-md text-sm leading-7 text-white/54">
              Buying signals. Verified decision-makers. Manual QA. Personalized outreach.
            </div>
          </div>

          <div className="grid gap-8 min-[460px]:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Experience</h3>
              <div className="space-y-3 text-sm text-white/70">
                <Link className="block transition-colors hover:text-white" href="/#process">
                  Process
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.SAMPLE}>
                  Request sample
                </Link>
                <Link className="block transition-colors hover:text-white" href="/#why-frithly">
                  Why Frithly
                </Link>
                <Link className="block transition-colors hover:text-white" href="/#receive">
                  What you receive
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.FAQ}>
                  FAQ
                </Link>
                <Link
                  className="block transition-colors hover:text-white"
                  href={ROUTES.BOOK_MEETING}
                  rel="noreferrer"
                  target="_blank"
                >
                  Book call
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Program</h3>
              <div className="space-y-3 text-sm text-white/70">
                <span className="block">
                  Signal discovery, manual qualification, verified contacts, and ready-to-send
                  outreach.
                </span>
                <Link className="block transition-colors hover:text-white" href={ROUTES.CONTACT}>
                  Contact
                </Link>
                <span className="block">
                  Built for B2B SaaS, AI agencies, software companies, cybersecurity, and
                  consulting firms.
                </span>
              </div>
            </div>

            <div className="space-y-4 min-[460px]:col-span-2 xl:col-span-1">
              <h3 className="text-base font-semibold text-white">Legal</h3>
              <div className="grid gap-x-6 gap-y-3 text-sm text-white/70 min-[460px]:grid-cols-2 xl:grid-cols-1">
                <Link className="block transition-colors hover:text-white" href={ROUTES.PRIVACY}>
                  Privacy Policy
                </Link>
                <Link
                  className="block transition-colors hover:text-white"
                  href={ROUTES.REFUND_POLICY}
                >
                  Refund Policy
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.TERMS}>
                  Terms of Service
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.GDPR_POLICY}>
                  GDPR Policy
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.COOKIE_POLICY}>
                  Cookie Policy
                </Link>
                <Link
                  className="block transition-colors hover:text-white"
                  href={ROUTES.ACCEPTABLE_USE_POLICY}
                >
                  Acceptable Use Policy
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.DISCLAIMER}>
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-5 text-sm text-white/60 md:space-y-1">
          <p>Copyright 2026 {APP_NAME}. All rights reserved.</p>
          <p className="leading-7">{SUPPORT_EMAIL}</p>
        </div>
      </Container>
    </footer>
  );
}
