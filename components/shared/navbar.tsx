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
  { href: "/#problem", label: "Why Outbound Fails" },
  { href: "/#deliverables", label: "What You Get" },
  { href: "/#pipeline", label: "How It Works" },
  { href: "/#pilot", label: "Start Small" },
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
      ? "border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(3,4,6,0.9),rgba(3,4,6,0.74))] shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      : "border-b border-white/[0.04] bg-[linear-gradient(180deg,rgba(3,4,6,0.78),rgba(3,4,6,0.42))] backdrop-blur-xl"
    : "border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(3,4,6,0.92),rgba(3,4,6,0.78))] shadow-[0_16px_44px_rgba(0,0,0,0.28)] backdrop-blur-2xl";

  const homeTextClassName = isScrolled ? "text-white/80 hover:text-white" : "text-white/82 hover:text-white";
  const defaultTextClassName = "text-white/76 transition-colors hover:text-white";
  const linkClassName = isHome ? homeTextClassName : defaultTextClassName;
  const iconButtonClassName = isHome
    ? "inline-flex items-center justify-center rounded-[0.9rem] p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(196,181,253,0.22)]"
    : "inline-flex items-center justify-center rounded-[0.9rem] p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(196,181,253,0.22)]";
  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${navClassName}`}>
      <Container className="relative flex h-16 items-center justify-between">
        <Logo imageClassName="h-8 sm:h-9 lg:h-10" priority />

        <div className="hidden items-center gap-8 lg:flex">
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

        <div className="hidden items-center gap-4 lg:flex">
          <Button
            asChild
            size="md"
            variant="secondary"
            className="rounded-[0.82rem] border-white/[0.08] bg-[#11151c] text-white shadow-[0_16px_36px_rgba(0,0,0,0.18)] hover:border-white/[0.14] hover:bg-[#171c24] hover:text-white"
          >
            <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
          </Button>
          <Button
            asChild
            size="md"
            className="rounded-[0.82rem] border-white/[0.08] bg-[linear-gradient(180deg,rgba(23,27,34,0.98),rgba(11,14,18,1))] text-white shadow-[0_18px_42px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(28,33,40,1),rgba(13,16,20,1))]"
          >
            <Link href={ROUTES.APPLY}>Apply</Link>
          </Button>
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className={`${iconButtonClassName} lg:hidden`}
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
        <div className="lg:hidden">
          <button
            aria-label="Close menu overlay"
            className="fixed inset-0 top-16 z-40 bg-[rgba(4,10,17,0.68)] backdrop-blur-[3px]"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div
            className={
              "fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-[linear-gradient(180deg,rgba(3,4,6,0.98),rgba(3,4,6,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.32)]"
            }
          >
            <Container className="flex flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                  Explore Frithly
                </p>
                <p className="hidden text-sm leading-6 text-white/62 min-[460px]:block">
                  Explore how Frithly turns broad outbound targeting into smaller, higher-relevance
                  opportunities your team can actually work.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-white/[0.07] rounded-[1rem] border border-white/[0.06] bg-white/[0.02]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3.5 text-[0.98rem] font-semibold text-white transition-colors hover:text-white/72 sm:py-4 sm:text-base"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-[0.88rem] border-white/[0.08] bg-[#11151c] text-white hover:border-white/[0.14] hover:bg-[#171c24] hover:text-white"
                >
                  <Link href={ROUTES.BOOK_MEETING}>
                    Book a meeting
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full rounded-[0.88rem] border-white/[0.08] bg-[linear-gradient(180deg,rgba(23,27,34,0.98),rgba(11,14,18,1))] text-white shadow-[0_18px_42px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(28,33,40,1),rgba(13,16,20,1))]">
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
