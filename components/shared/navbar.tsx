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
  { href: "/#process", label: "Process" },
  { href: "/#why-frithly", label: "Why Frithly" },
  { href: ROUTES.GUIDES, label: "Free Guide" },
  { href: ROUTES.FAQ, label: "FAQ" },
  { highlight: true, href: ROUTES.BOOK_MEETING, label: "Book 1 on 1 Call" },
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
      ? "border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(5,5,5,0.94),rgba(9,9,9,0.84))] shadow-[0_16px_44px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
      : "border-b border-white/[0.04] bg-[linear-gradient(180deg,rgba(5,5,5,0.82),rgba(5,5,5,0.48))] backdrop-blur-xl"
    : "border-b border-white/[0.05] bg-[linear-gradient(180deg,rgba(5,5,5,0.96),rgba(9,9,9,0.88))] shadow-[0_16px_44px_rgba(0,0,0,0.34)] backdrop-blur-2xl";

  const homeTextClassName = isScrolled ? "text-white/80 hover:text-white" : "text-white/82 hover:text-white";
  const defaultTextClassName = "text-white/76 transition-colors hover:text-white";
  const linkClassName = isHome ? homeTextClassName : defaultTextClassName;
  const iconButtonClassName = isHome
    ? "inline-flex items-center justify-center rounded-[0.9rem] p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(196,181,253,0.22)]"
    : "inline-flex items-center justify-center rounded-[0.9rem] p-2 text-white transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(196,181,253,0.22)]";
  const gradientButtonClassName =
    "rounded-[0.92rem] border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#050505] shadow-[0_18px_44px_rgba(201,183,255,0.18)] hover:brightness-[1.03] hover:text-[#050505]";

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${navClassName}`}>
      <Container className="relative flex h-16 items-center justify-between">
        <Logo imageClassName="h-8 sm:h-9 lg:h-10" priority />

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isHighlighted = "highlight" in link && link.highlight;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isHighlighted
                    ? "rounded-full border border-white/[0.08] bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition-all hover:border-[rgba(201,183,255,0.22)] hover:bg-white/[0.07] hover:shadow-[0_0_32px_rgba(201,183,255,0.12)]"
                    : `text-sm font-medium transition-colors ${linkClassName}`
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Button
            asChild
            size="md"
            className={gradientButtonClassName}
          >
            <Link href={ROUTES.SAMPLE}>Request Sample</Link>
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
            className="fixed inset-0 top-16 z-40 bg-[rgba(5,5,5,0.72)] backdrop-blur-[4px]"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div
            className={
              "fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/[0.06] bg-[linear-gradient(180deg,rgba(5,5,5,0.99),rgba(9,9,9,0.96))] shadow-[0_24px_60px_rgba(0,0,0,0.36)]"
            }
          >
            <Container className="flex flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                  Explore Frithly
                </p>
                <p className="hidden text-sm leading-6 text-white/62 min-[460px]:block">
                  Explore how Frithly turns buying signals into manually qualified, verified,
                  outbound-ready opportunities.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-white/[0.07] rounded-[1rem] border border-white/[0.06] bg-white/[0.02]">
                {navLinks.map((link) => {
                  const isHighlighted = "highlight" in link && link.highlight;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-3.5 text-[0.98rem] font-semibold text-white transition-colors hover:text-white/72 sm:py-4 sm:text-base ${
                        isHighlighted ? "bg-white/[0.035] text-white" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className={`w-full ${gradientButtonClassName}`}
                >
                  <Link href={ROUTES.SAMPLE}>Request Sample</Link>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
