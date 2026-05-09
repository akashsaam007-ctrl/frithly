"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Boxes, ClipboardCheck, LayoutDashboard, Menu, MessageSquare, Send, Users, X } from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Logo } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/utils/mode";

const navItems = [
  { href: ROUTES.ADMIN, icon: LayoutDashboard, label: "Overview" },
  { href: ROUTES.ADMIN_APPLICATIONS, icon: ClipboardCheck, label: "Applications" },
  { href: ROUTES.ADMIN_DELIVERIES, icon: Send, label: "Deliveries" },
  { href: ROUTES.ADMIN_CUSTOMERS, icon: Users, label: "Customers" },
  { href: ROUTES.ADMIN_BATCHES_NEW, icon: Boxes, label: "Batches" },
  { href: ROUTES.ADMIN_FEEDBACK, icon: MessageSquare, label: "Feedback" },
  { href: `${ROUTES.ADMIN}#metrics`, icon: Activity, label: "Metrics" },
] as const;

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <span className="sr-only">Open admin sidebar</span>
            </button>
            <Logo className="text-xl" />
          </div>

          <p className="hidden text-sm font-semibold text-white/62 md:block">Frithly Admin</p>
          <SignOutButton size="sm" variant="secondary" />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-white/10 bg-[#07111b] p-6 md:block">
          <nav className="space-y-2">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-white/[0.08] text-ink"
                    : "text-muted hover:bg-white/[0.05] hover:text-ink",
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
              <span className="sr-only">Close admin sidebar</span>
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
                    ? "bg-white/[0.08] text-ink"
                    : "text-muted hover:bg-white/[0.05] hover:text-ink",
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
