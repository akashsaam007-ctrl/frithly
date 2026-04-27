"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, CircleHelp, CreditCard, Inbox, Menu, Target, X } from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/utils/mode";

const navItems = [
  { href: ROUTES.DASHBOARD, icon: BarChart3, label: "Dashboard" },
  { href: ROUTES.BRIEFS, icon: Inbox, label: "Briefs" },
  { href: ROUTES.ICP, icon: Target, label: "ICP Settings" },
  { href: ROUTES.BILLING, icon: CreditCard, label: "Billing" },
  { href: ROUTES.HELP, icon: CircleHelp, label: "Help" },
];

type CustomerShellProps = {
  children: React.ReactNode;
  companyName: string;
};

export function CustomerShell({ children, companyName }: CustomerShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-cream md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open sidebar</span>
            </button>
            <Logo className="text-xl" />
          </div>

          <p className="hidden text-sm font-semibold text-muted md:block">{companyName}</p>

          <details className="relative">
            <summary className="list-none">
              <Button size="sm" variant="secondary">Account</Button>
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border bg-white p-3 shadow-lg">
              <div className="space-y-2">
                <Link className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-cream" href={ROUTES.BILLING}>
                  Billing
                </Link>
                <Link className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-cream" href={ROUTES.ICP}>
                  Settings
                </Link>
                <SignOutButton className="w-full justify-start" size="sm" variant="ghost" />
              </div>
            </div>
          </details>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border bg-white p-6 md:block">
          <nav className="space-y-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-cream text-ink"
                    : "text-muted hover:bg-cream hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 md:px-8">{children}</main>
      </div>

      {isDemoMode ? (
        <div className="fixed bottom-4 right-4 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-muted shadow-lg">
          Demo mode active
        </div>
      ) : null}

      <div className={cn("fixed inset-0 z-50 bg-ink/40 transition-opacity md:hidden", mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")}>
        <div className={cn("h-full w-72 bg-white p-6 transition-transform", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-8 flex items-center justify-between">
            <Logo className="text-xl" />
            <button
              type="button"
              className="rounded-lg p-2 text-ink transition-colors hover:bg-cream"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-cream text-ink"
                    : "text-muted hover:bg-cream hover:text-ink",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
