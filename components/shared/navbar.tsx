"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
});

const marketingNavLinks = [
  { href: "/#process", label: "Process" },
  { href: "/#why-frithly", label: "Why Frithly" },
  { href: "/#receive", label: "What You Receive" },
  { href: ROUTES.FAQ, label: "FAQ" },
] as const;

const primaryButtonClassName =
  "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

const ghostButtonClassName =
  "rounded-[3px] border border-[#262b31] bg-transparent px-5 text-[#f3f1ea] shadow-none hover:border-[#9ba1a8] hover:bg-transparent hover:text-[#f3f1ea] focus-visible:ring-[#e7a6d6]";

function Wordmark() {
  return (
    <Link
      aria-label="Frithly home"
      className="inline-flex items-center gap-3 text-[#f3f1ea] transition-opacity hover:opacity-90"
      href={ROUTES.HOME}
    >
      <span className="h-2 w-2 rounded-[2px] bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)]" />
      <span className={cn(displayFont.className, "text-[1.35rem] font-bold tracking-[-0.02em]")}>
        Frithly
      </span>
    </Link>
  );
}

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
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#1e2227] bg-[#0c0e11]/82 text-[#f3f1ea] backdrop-blur-[10px]">
      <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
      <Container className="relative flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <div className="hidden sm:block">
          <Wordmark />
        </div>
        <div className="sm:hidden">
          <Logo imageClassName="h-7" priority />
        </div>

        <div className={cn(bodyFont.className, "hidden items-center gap-8 min-[900px]:flex")}>
          {marketingNavLinks.map((link) => (
            <Link
              className="text-[14px] font-medium text-[#9ba1a8] transition-colors hover:text-[#f3f1ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a6d6]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 min-[900px]:flex">
          <Button asChild className={ghostButtonClassName} size="sm" variant="secondary">
            <Link href={ROUTES.BOOK_MEETING}>Book a call</Link>
          </Button>
          <Button asChild className={primaryButtonClassName} size="sm">
            <Link href={ROUTES.SAMPLE}>Request sample</Link>
          </Button>
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex items-center justify-center rounded-[3px] border border-[#262b31] p-2 text-[#f3f1ea] transition-colors hover:border-[#9ba1a8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a6d6] min-[900px]:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {isMenuOpen ? (
        <div className="min-[900px]:hidden">
          <button
            aria-label="Close menu overlay"
            className="fixed inset-0 top-16 z-40 bg-[#0c0e11]/78 backdrop-blur-[4px]"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className="fixed inset-x-0 top-16 z-50 border-t border-[#1e2227] bg-[#0c0e11] shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
            <Container className="flex max-w-[1180px] flex-col gap-5 px-5 py-6 sm:px-8">
              <p className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.14em] text-[#e7a6d6]")}>
                Menu
              </p>
              <div className="divide-y divide-[#1e2227] border border-[#262b31]">
                {marketingNavLinks.map((link) => (
                  <Link
                    className="block px-4 py-4 text-[15px] font-semibold text-[#f3f1ea] transition-colors hover:text-[#e7a6d6]"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
                  <Link href={ROUTES.BOOK_MEETING}>Book a call</Link>
                </Button>
                <Button asChild className={primaryButtonClassName} size="lg">
                  <Link href={ROUTES.SAMPLE}>Request sample</Link>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
