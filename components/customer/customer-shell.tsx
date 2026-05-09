"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CircleHelp,
  CreditCard,
  Download,
  Layers3,
  LockKeyhole,
  Menu,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/utils/mode";

const navItems = [
  { href: ROUTES.DASHBOARD, icon: BarChart3, label: "Dashboard" },
  { href: ROUTES.RECOMMENDATIONS, icon: Sparkles, label: "Opportunities", requiresPlan: true },
  { href: ROUTES.COHORTS, icon: Layers3, label: "Cohorts", requiresPlan: true },
  { href: ROUTES.ANALYTICS, icon: TrendingUp, label: "Analytics", requiresPlan: true },
  { href: ROUTES.EXPORTS, icon: Download, label: "Exports", requiresPlan: true },
  { href: ROUTES.BILLING, icon: CreditCard, label: "Plans" },
  { href: ROUTES.HELP, icon: CircleHelp, label: "Help" },
];

type CustomerShellProps = {
  children: React.ReactNode;
  companyName: string;
  hasWorkspaceAccess: boolean;
};

export function CustomerShell({ children, companyName, hasWorkspaceAccess }: CustomerShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAccountPage = pathname === ROUTES.ACCOUNT;

  function isActiveRoute(href: string) {
    if (pathname === href) {
      return true;
    }

    if (href === ROUTES.DASHBOARD || href === ROUTES.BILLING || href === ROUTES.HELP) {
      return false;
    }

    return pathname.startsWith(`${href}/`);
  }

  function renderNavItem({
    href,
    icon: Icon,
    label,
    requiresPlan,
  }: (typeof navItems)[number], onClick?: () => void) {
    const isLocked = Boolean(requiresPlan) && !hasWorkspaceAccess;
    const sharedClasses =
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors";

    if (isLocked) {
      return (
        <div
          key={href}
          aria-disabled="true"
          className={cn(
            sharedClasses,
            "cursor-not-allowed border border-dashed border-white/10 bg-white/[0.03] text-white/45",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
          <LockKeyhole className="ml-auto h-4 w-4" aria-hidden="true" />
        </div>
      );
    }

    return (
      <Link
        key={href}
        href={href}
        className={cn(
          sharedClasses,
          isActiveRoute(href)
            ? "bg-white/[0.08] text-ink"
            : "text-muted hover:bg-white/[0.05] hover:text-ink",
        )}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </Link>
    );
  }

  function renderUpgradePrompt() {
    if (hasWorkspaceAccess) {
      return null;
    }

    return (
      <div className="mt-6 rounded-2xl border border-terracotta/20 bg-terracotta/8 p-4 text-sm text-muted">
        <p className="font-semibold text-ink">Talk to sales to unlock your workspace.</p>
        <p className="mt-2 leading-6">
          We&apos;ll confirm the right plan and switch on curated delivery, cohort review, and
          analytics after kickoff.
        </p>
        <Link
          href={ROUTES.BILLING}
          className="mt-3 inline-flex font-semibold text-terracotta underline underline-offset-4"
        >
          View plans
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050c14] text-[#fff7f1]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111b]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/8 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <Logo className="text-xl" />
          </div>

          <p className="hidden text-sm font-semibold text-white/62 md:block">{companyName}</p>

          <Button asChild size="sm" variant={isAccountPage ? "primary" : "secondary"}>
            <Link href={ROUTES.ACCOUNT}>
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              Account
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-white/10 bg-[#07111b] p-6 md:block">
          <nav className="space-y-2">
            {navItems.map((item) => renderNavItem(item))}
          </nav>
          {renderUpgradePrompt()}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 md:px-8">{children}</main>
      </div>

      {isDemoMode ? (
        <div className="fixed bottom-4 right-4 rounded-full border border-white/10 bg-[#0b1520] px-4 py-2 text-sm font-medium text-muted shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
          Demo mode active
        </div>
      ) : null}

      <div className={cn("fixed inset-0 z-50 bg-ink/40 transition-opacity md:hidden", mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")}>
        <div className={cn("h-full w-72 bg-[#07111b] p-6 transition-transform", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-8 flex items-center justify-between">
            <Logo className="text-xl" />
            <button
              type="button"
              className="rounded-lg p-2 text-white transition-colors hover:bg-white/8"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => renderNavItem(item, () => setMobileOpen(false)))}
          </nav>
          {renderUpgradePrompt()}
        </div>
      </div>
    </div>
  );
}
