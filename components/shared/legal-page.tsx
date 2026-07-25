import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-body",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

type LegalSection = {
  body: ReactNode;
  id?: string;
  title: string;
};

type LegalPageProps = {
  intro: ReactNode;
  kicker: string;
  lastUpdated: string;
  sections: LegalSection[];
  title: string;
};

export function LegalPage({
  intro,
  kicker,
  lastUpdated,
  sections,
  title,
}: LegalPageProps) {
  return (
    <main className={cn(bodyFont.className, "relative isolate overflow-hidden bg-[#0c0e11] py-[76px] text-[#f3f1ea] sm:py-[96px] lg:py-[120px]")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

      <Container width="narrow" className="relative max-w-[960px] space-y-10 px-5 sm:px-8">
        <div className="space-y-6">
          <div
            className={cn(
              monoFont.className,
              "inline-flex items-center gap-3 rounded-[3px] border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
            )}
          >
            <span className="h-px w-8 bg-[#e7a6d6]/70" />
            {kicker}
          </div>

          <div className="space-y-4">
            <h1
              className={cn(
                displayFont.className,
                "max-w-4xl text-[36px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[56px]",
              )}
            >
              {title}
            </h1>
            <p className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.14em] text-[#5c636b]")}>
              Last updated: {lastUpdated}
            </p>
          </div>

          <div
            className={cn(
              "max-w-3xl space-y-4 text-[16px] leading-[1.7] text-[#9ba1a8]",
              "[&_a]:font-semibold [&_a]:text-[#e7a6d6] [&_a]:underline-offset-4 hover:[&_a]:text-[#f3f1ea] [&_a]:transition-colors",
              "[&_p]:text-[#9ba1a8]",
            )}
          >
            {intro}
          </div>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
          <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
          <div className="space-y-6 p-5 sm:p-7 md:p-8">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.id}
                className="scroll-mt-28 space-y-4 rounded-[6px] border border-[#262b31] bg-[#0c0e11]/78 p-5 sm:p-6"
              >
                <h2 className={cn(displayFont.className, "text-[22px] font-semibold leading-snug text-[#f3f1ea] sm:text-[26px]")}>
                  {section.title}
                </h2>
                <div
                  className={cn(
                    "space-y-4 text-[15px] leading-[1.75] text-[#9ba1a8]",
                    "[&_p]:text-[#9ba1a8]",
                    "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[#9ba1a8]",
                    "[&_li]:text-[#9ba1a8]",
                    "[&_a]:font-semibold [&_a]:text-[#e7a6d6] [&_a]:underline-offset-4 hover:[&_a]:text-[#f3f1ea] [&_a]:transition-colors",
                    "[&_strong]:text-[#f3f1ea]",
                  )}
                >
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
