"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";

const marketingNavLinks = [
  { href: ROUTES.ABOUT, label: "About" },
  { href: "/#why-outbound-fails", label: "Why Quality Wins" },
  { href: ROUTES.HOW_IT_WORKS, label: "Intelligence Flow" },
  { href: "/#icp-demo", label: "Demo" },
  { href: ROUTES.PRICING, label: "Program Builder" },
  { href: "/#roi", label: "ROI" },
  { href: ROUTES.FAQ, label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === ROUTES.HOME;
  const navLinks = marketingNavLinks;

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

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

  const navClassName = isHome
    ? isScrolled
      ? "border-b border-white/10 bg-[#06101a]/84 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      : "border-b border-transparent bg-transparent"
    : "border-b border-white/10 bg-[#06101a]/88 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl";

  const homeTextClassName = isScrolled ? "text-white/76 hover:text-white" : "text-white/78 hover:text-white";
  const defaultTextClassName = "text-white/72 transition-colors hover:text-white";
  const linkClassName = isHome ? homeTextClassName : defaultTextClassName;
  const iconButtonClassName = isHome
    ? "inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
    : "inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta";
  const loginClassName = isHome ? "text-sm font-medium text-white/76 transition-colors hover:text-white" : "text-sm font-medium text-white/72 transition-colors hover:text-white";

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${navClassName}`}>
      <Container className="relative flex h-16 items-center justify-between">
        <Logo priority />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${linkClassName}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={ROUTES.LOGIN}
            className={loginClassName}
          >
            Login
          </Link>
          <Button
            asChild
            size="md"
            variant="secondary"
            className="border-white/10 bg-white/[0.05] text-white hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
          >
            <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
          </Button>
          <Button
            asChild
            size="md"
            className={isHome ? "shadow-[0_18px_48px_rgba(212,98,58,0.22)]" : undefined}
          >
            <Link href={ROUTES.APPLY}>Apply</Link>
          </Button>
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={`${iconButtonClassName} md:hidden`}
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
            className="fixed inset-0 top-16 z-40 bg-[rgba(4,10,17,0.68)] backdrop-blur-[3px]"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div
            className={
              "fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-[#06101a] shadow-[0_24px_60px_rgba(0,0,0,0.32)]"
            }
          >
            <Container className="flex flex-col gap-6 px-5 py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0b38e]">
                  Explore Frithly
                </p>
                <p className="text-sm leading-6 text-white/62">
                  Step into the intelligence flow: reviewed opportunities, founder-aware targeting,
                  SMTP-aware routing, and premium weekly delivery.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-4 text-base font-semibold text-white transition-colors hover:text-[#f0b38e]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={ROUTES.LOGIN}
                  className="px-4 py-4 text-base font-semibold text-white transition-colors hover:text-[#f0b38e]"
                >
                  Login
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full border-white/10 bg-white/[0.05] text-white hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                >
                  <Link href={ROUTES.BOOK_MEETING}>
                    Book a meeting
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full">
                  <Link href={ROUTES.APPLY}>Apply</Link>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
