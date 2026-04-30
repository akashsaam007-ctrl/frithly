import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";

const navLinks = [
  { href: ROUTES.HOW_IT_WORKS, label: "How It Works" },
  { href: ROUTES.PRICING, label: "Pricing" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-white/88 shadow-[0_6px_24px_rgba(26,26,26,0.04)] backdrop-blur-xl">
      <Container className="relative flex h-16 items-center justify-between">
        <Logo priority />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Login
          </Link>
          <Button asChild size="md">
            <Link href={ROUTES.SIGNUP}>Get Free Sample</Link>
          </Button>
        </div>

        <details className="group md:hidden">
          <summary className="inline-flex list-none items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
            <Menu className="h-5 w-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden h-5 w-5 group-open:block" aria-hidden="true" />
          </summary>

          <div className="absolute inset-x-0 top-full border-t border-border bg-white/96 shadow-[0_16px_40px_rgba(26,26,26,0.08)] backdrop-blur">
            <Container className="flex flex-col gap-4 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ROUTES.LOGIN}
                className="text-base font-medium text-muted transition-colors hover:text-ink"
              >
                Login
              </Link>
              <Button asChild size="lg">
                <Link href={ROUTES.SIGNUP}>Get Free Sample</Link>
              </Button>
            </Container>
          </div>
        </details>
      </Container>
    </nav>
  );
}
