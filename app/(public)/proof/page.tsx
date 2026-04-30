import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { proofPages } from "@/lib/proof-pages";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const proofDescription =
  "Case-study style proof pages that show the representative Frithly motion for founder-led outbound teams, small SDR pods, and lean GTM operators.";

export const metadata: Metadata = buildPublicMetadata({
  description: proofDescription,
  keywords: [
    "outbound case study",
    "B2B lead research case study",
    "founder-led outbound proof",
    "sales intelligence proof pages",
  ],
  path: ROUTES.PROOF,
  title: "Proof | Frithly",
});

export default function ProofHubPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Proof", path: ROUTES.PROOF },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: proofDescription,
          path: ROUTES.PROOF,
          title: "Proof | Frithly",
        })}
      />

      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Proof</div>
          <h1 className="section-title mt-5">
            Case-study style proof pages for buyers who want to see the motion clearly.
          </h1>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            These pages are intentionally honest. They show representative Frithly scenarios and
            operating changes without pretending to be named customer testimonials.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {proofPages.map((page) => (
            <article key={page.slug} className="surface-card h-full p-6 sm:p-7">
              <div className="section-eyebrow">{page.kicker}</div>
              <h2 className="mt-5 text-3xl font-semibold text-ink">{page.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">{page.description}</p>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href={`${ROUTES.PROOF}/${page.slug}`}>
                    <span className="inline-flex items-center gap-2">
                      Read proof page
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="surface-card-dark p-6 sm:p-7 md:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Want a proof page tailored to your actual ICP instead of a representative one?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                Request a sample and compare Frithly against the quality, timing context, and
                first-touch direction your team gets today.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.SAMPLE}>Get a free 5-lead sample</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
