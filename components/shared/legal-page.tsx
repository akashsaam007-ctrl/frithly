import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

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
    <main className="relative overflow-hidden bg-[#050505] py-20 text-white md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,194,139,0.05),transparent_18%),radial-gradient(circle_at_78%_14%,rgba(201,183,255,0.08),transparent_18%),radial-gradient(circle_at_52%_72%,rgba(232,167,215,0.05),transparent_24%),linear-gradient(180deg,#050505_0%,#090909_42%,#111111_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:176px_176px] opacity-[0.04]" />

      <Container width="narrow" className="relative space-y-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-white/74">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] blur-[6px]" />
              <span className="relative rounded-full bg-white/85" />
            </span>
            {kicker}
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-[3.6rem] lg:text-[4.5rem]">
              {title}
            </h1>
            <p className="text-sm uppercase tracking-[0.14em] text-white/42">Last updated: {lastUpdated}</p>
          </div>

          <div
            className={cn(
              "max-w-3xl space-y-4 text-[1rem] leading-8 text-white/68 sm:text-[1.04rem]",
              "[&_a]:font-semibold [&_a]:text-[#d8c9ff] [&_a]:underline-offset-4 hover:[&_a]:text-white [&_a]:transition-colors",
              "[&_p]:text-white/68",
            )}
          >
            {intro}
          </div>
        </div>

        <Card className="overflow-hidden border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-8 p-6 md:p-8">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.id}
                className="scroll-mt-28 rounded-[1.35rem] border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 space-y-4"
              >
                <h2 className="text-[1.55rem] font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
                  {section.title}
                </h2>
                <div
                  className={cn(
                    "space-y-4 text-[0.98rem] leading-8 text-white/66 sm:text-[1rem]",
                    "[&_p]:text-white/66",
                    "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-white/66",
                    "[&_li]:text-white/66",
                    "[&_a]:font-semibold [&_a]:text-[#d8c9ff] [&_a]:underline-offset-4 hover:[&_a]:text-white [&_a]:transition-colors",
                    "[&_strong]:text-white",
                  )}
                >
                  {section.body}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
