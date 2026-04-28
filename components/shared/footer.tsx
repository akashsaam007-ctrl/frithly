import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { APP_LOCATION, APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-14 text-white">
      <Container className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div className="space-y-4">
            <Logo className="text-white hover:text-white" />
            <p className="max-w-sm text-base leading-8 text-white/70">
              Weekly B2B lead intelligence for outbound teams that need signal, timing, and
              messaging context.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Product</h3>
              <div className="space-y-3 text-sm text-white/70">
                <Link className="block transition-colors hover:text-white" href={ROUTES.PRICING}>
                  Pricing
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.LOGIN}>
                  Login
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.SAMPLE}>
                  Sample
                </Link>
                <Link className="block transition-colors hover:text-white" href={ROUTES.FAQ}>
                  FAQ
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Company</h3>
              <div className="space-y-3 text-sm text-white/70">
                <span className="block">About: N/A for now</span>
                <a
                  className="block transition-colors hover:text-white"
                  href={`mailto:${SUPPORT_EMAIL}`}
                >
                  Contact
                </a>
                <span className="block">Careers: N/A for now</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Resources</h3>
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

        <div className="border-t border-white/10 pt-6 text-sm text-white/60">
          <p>Copyright 2026 {APP_NAME}. All rights reserved.</p>
          <p>{SUPPORT_EMAIL} | Based in {APP_LOCATION} | Working globally</p>
        </div>
      </Container>
    </footer>
  );
}
