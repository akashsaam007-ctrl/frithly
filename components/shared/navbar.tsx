"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { CALCOM_URL, ROUTES } from "@/lib/constants";

const defaultNavLinks = [
  { href: ROUTES.ABOUT, label: "About" },
  { href: ROUTES.CONTACT, label: "Contact" },
  { href: ROUTES.DEMO, label: "Demo" },
  { href: ROUTES.ROI, label: "ROI" },
  { href: ROUTES.HOW_IT_WORKS, label: "How It Works" },
  { href: ROUTES.PRICING, label: "Program" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

const homeNavLinks = [
  { href: ROUTES.HOW_IT_WORKS, label: "Flow" },
  { href: "/#why-outbound-fails", label: "Why Quality Wins" },
  { href: "/#icp-demo", label: "Demo" },
  { href: ROUTES.PRICING, label: "Program" },
  { href: "/#roi-experience", label: "ROI" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isHome = pathname === ROUTES.HOME;
  const navLinks = isHome ? homeNavLinks : defaultNavLinks;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) {
      setHasScrolled(false);
      return;
    }

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

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
    <nav
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        isHome
          ? cn(
              "border-b border-white/10 backdrop-blur-2xl",
              hasScrolled
                ? "bg-[#08111bec] shadow-[0_18px_46px_rgba(0,0,0,0.28)]"
                : "bg-[#08111bb0]",
            )
          : "border-b border-border/70 bg-white/84 shadow-[0_8px_26px_rgba(26,26,26,0.05)] backdrop-blur-xl",
      )}
    >
      <Container className="relative flex h-16 items-center justify-between">
        <Logo
          className={cn(
            "rounded-2xl px-3 py-2",
            isHome && "bg-white shadow-[0_12px_26px_rgba(0,0,0,0.16)]",
          )}
          priority
        />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isHome
                  ? "text-white/66 hover:text-white"
                  : "text-muted hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={ROUTES.LOGIN}
            className={cn(
              "text-sm font-medium transition-colors",
              isHome
                ? "text-white/66 hover:text-white"
                : "text-muted hover:text-ink",
            )}
          >
            Login
          </Link>
          <Button
            asChild
            size="md"
            className={cn(
              isHome && "shadow-[0_18px_42px_rgba(212,98,58,0.22)]",
            )}
          >
            <Link href={ROUTES.APPLY}>
              Apply
            </Link>
          </Button>
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden",
            isHome
              ? "text-white hover:bg-white/10"
              : "text-ink hover:bg-cream",
          )}
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
                  Step into the intelligence flow: reviewed opportunities, founder-aware targeting,
                  SMTP-safe routing, and premium weekly delivery.
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
                  <Link href={ROUTES.APPLY}>
                    Apply for a campaign
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href={CALCOM_URL} rel="noreferrer" target="_blank">
                    Request walkthrough
                  </Link>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
