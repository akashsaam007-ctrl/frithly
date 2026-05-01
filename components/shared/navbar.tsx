"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";

const navLinks = [
  { href: ROUTES.ABOUT, label: "About" },
  { href: ROUTES.CONTACT, label: "Contact" },
  { href: ROUTES.HOW_IT_WORKS, label: "How It Works" },
  { href: ROUTES.PRICING, label: "Pricing" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

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

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      {isMenuOpen ? (
        <div className="md:hidden">
          <button
            aria-label="Close menu overlay"
            className="fixed inset-0 top-16 z-40 bg-[rgba(12,12,12,0.18)] backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-white shadow-[0_18px_44px_rgba(26,26,26,0.12)]">
            <Container className="flex flex-col gap-6 px-5 py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                  Explore Frithly
                </p>
                <p className="text-sm leading-6 text-muted">
                  See how Frithly turns raw lead data into weekly outbound briefs your team can use.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-border/70 rounded-2xl border border-border/80 bg-stone-50">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-4 text-base font-semibold text-ink transition-colors hover:text-terracotta"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={ROUTES.LOGIN}
                  className="px-4 py-4 text-base font-semibold text-ink transition-colors hover:text-terracotta"
                >
                  Login
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href={ROUTES.SIGNUP}>Get Free Sample</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href={ROUTES.PRICING}>View plans</Link>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
