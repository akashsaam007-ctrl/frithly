import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { APP_NAME, BUSINESS_ADDRESS, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#07111b_0%,#050d15_100%)] py-12 text-white sm:py-14">
      <Container className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1.95fr]">
          <div className="space-y-5">
            <Logo
              className="w-fit rounded-[1.35rem] bg-white px-4 py-3 shadow-sm hover:opacity-100"
              imageClassName="h-8 md:h-9"
            />
            <p className="max-w-sm text-base leading-8 text-white/70">
              Curated outbound intelligence delivered weekly for teams that would rather work a
              smaller, stronger opportunity flow than chase noisy volume.
            </p>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/66">
              Reviewed opportunities. Founder-aware targeting. SMTP-safe prioritization. Calm,
              confidence-aware delivery.
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Experience</h3>
              <div className="space-y-3 text-sm text-white/70">
                <Link className="block transition-colors hover:text-white" href={ROUTES.HOW_IT_WORKS}>
                  Intelligence flow
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.PRICING}>
                  Program builder
                </Link>
                <Link className="block transition-colors hover:text-white" href="/#icp-demo">
                  ICP demo
                </Link>
                <Link className="block transition-colors hover:text-white" href="/#roi-experience">
                  ROI simulator
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.FAQ}>
                  FAQ
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.APPLY}>
                  Apply for a campaign
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Program</h3>
              <div className="space-y-3 text-sm text-white/70">
                <span className="block">Premium outbound intelligence for selective pipeline teams</span>
                <Link className="block transition-colors hover:text-white" href={ROUTES.APPLY}>
                  Campaign application
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.LOGIN}>
                  Client login
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.CONTACT}>
                  Contact
                </Link>
                <span className="block">Serving outbound teams across the UK, EU, and beyond</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Legal</h3>
              <div className="space-y-3 text-sm text-white/70">
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
                <Link
                  className="block transition-colors hover:text-white"
                  href={`${ROUTES.PRIVACY}#gdpr`}
                >
                  GDPR
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-6 text-sm text-white/60 md:space-y-1">
          <p>Copyright 2026 {APP_NAME}. All rights reserved.</p>
          <p className="leading-7">{SUPPORT_EMAIL} | {BUSINESS_ADDRESS}</p>
        </div>
      </Container>
    </footer>
  );
}
