import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CustomerPageHeroProps = {
  actions?: ReactNode;
  className?: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function CustomerPageHero({
  actions,
  className,
  description,
  eyebrow,
  title,
}: CustomerPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(14,24,36,0.98),rgba(10,18,28,0.94))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,98,58,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(121,227,208,0.08),transparent_30%)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/25 bg-terracotta/10 px-4 py-2 text-sm font-semibold text-terracotta">
              {eyebrow}
            </div>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-4xl text-ink md:text-5xl">{title}</h1>
            <div className="max-w-3xl text-lg leading-8 text-muted">{description}</div>
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
