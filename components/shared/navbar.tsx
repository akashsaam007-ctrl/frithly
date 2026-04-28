"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: ROUTES.HOW_IT_WORKS, label: "How It Works" },
  { href: ROUTES.PRICING, label: "Pricing" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-white transition-shadow",
        scrolled && "shadow-sm",
      )}
    >
      <Container className="flex h-14 items-center justify-between md:h-16">
        <Logo />

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
            <TrackedLink
              eventName="cta_clicked"
              eventProperties={{ destination: ROUTES.SIGNUP, location: "navbar_primary" }}
              href={ROUTES.SIGNUP}
            >
              Get Free Sample
            </TrackedLink>
          </Button>
        </div>

        <button
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 md:hidden",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id="mobile-navigation" className="overflow-hidden border-t border-border">
          <Container className="flex flex-col gap-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-muted transition-colors hover:text-ink"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ROUTES.LOGIN}
              className="text-base font-medium text-muted transition-colors hover:text-ink"
              onClick={closeMobileMenu}
            >
              Login
            </Link>
            <Button asChild size="lg">
              <TrackedLink
                eventName="cta_clicked"
                eventProperties={{
                  destination: ROUTES.SIGNUP,
                  location: "navbar_mobile_primary",
                }}
                href={ROUTES.SIGNUP}
                onClick={closeMobileMenu}
              >
                Get Free Sample
              </TrackedLink>
            </Button>
          </Container>
        </div>
      </div>
    </nav>
  );
}
