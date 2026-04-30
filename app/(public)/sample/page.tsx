import type { Metadata } from "next";
import { SampleRequestForm } from "@/components/landing/sample-request-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const sampleDescription =
  "Request a free 5-lead Frithly sample researched against your ICP within 48 hours and see exactly how your weekly brief would look before you subscribe.";

export const metadata: Metadata = buildPublicMetadata({
  description: sampleDescription,
  keywords: [
    "free B2B lead sample",
    "sales intelligence sample",
    "free lead research sample",
    "Frithly sample",
  ],
  path: "/sample",
  title: "Free Sample | Frithly",
});

export default function SamplePage() {
  return (
    <main className="py-20 md:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free Sample", path: "/sample" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: sampleDescription,
          path: "/sample",
          title: "Free Sample | Frithly",
        })}
      />

      <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-terracotta/20 bg-terracotta/10 px-4 py-2 text-sm font-semibold text-terracotta">
            Free sample within 48 hours
          </span>
          <div className="space-y-4">
            <h1>See what Frithly would send your team next Monday.</h1>
            <p className="text-muted">
              We&apos;ll research 5 leads against your ICP, add trigger context, and write
              personalized opening lines so you can judge the quality before you commit.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-2xl">What you&apos;ll get</h2>
            <ul className="mt-4 space-y-3 text-base text-muted md:text-lg">
              <li>- 5 hand-picked leads matched to your ICP</li>
              <li>- Why-now context and current trigger signals</li>
              <li>- Verified email status</li>
              <li>- 3 personalized openers per lead</li>
            </ul>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl">Request your sample</h2>
              <p className="text-muted">
                Tell us who you want to reach and what makes a lead worth your team&apos;s time.
              </p>
            </div>
            <SampleRequestForm />
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
