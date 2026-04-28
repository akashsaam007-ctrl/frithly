import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

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
    <main className="py-20 md:py-24">
      <Container width="narrow" className="space-y-10">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
            {kicker}
          </p>
          <div className="space-y-4">
            <h1>{title}</h1>
            <p className="text-sm text-muted">Last updated: {lastUpdated}</p>
          </div>
          <div className="max-w-3xl text-muted">{intro}</div>
        </div>

        <Card>
          <CardContent className="space-y-8 p-6 md:p-8">
            {sections.map((section) => (
              <section key={section.title} id={section.id} className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl md:text-3xl">{section.title}</h2>
                <div className="space-y-4 text-muted">{section.body}</div>
              </section>
            ))}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
