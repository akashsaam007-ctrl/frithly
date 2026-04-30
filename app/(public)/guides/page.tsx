import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { intentGuides } from "@/lib/intent-guides";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const guidesDescription =
  "Explore Frithly buying guides on B2B lead intelligence, founder-led outbound, prospect research services, and sales intelligence for early-stage SaaS teams.";

export const metadata: Metadata = buildPublicMetadata({
  description: guidesDescription,
  keywords: [
    "B2B lead intelligence guides",
    "Apollo alternative for founders",
    "sales intelligence guides",
    "outbound research guides",
  ],
  path: "/guides",
  title: "Guides | Frithly",
});

export default function GuidesPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: guidesDescription,
          path: "/guides",
          title: "Guides | Frithly",
        })}
      />

      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Guides</div>
          <h1 className="section-title mt-5">
            High-intent buying guides for teams comparing outbound research options.
          </h1>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            These pages are built for real search and answer intent. Start with the problem you
            are actually solving, then decide whether Frithly fits your motion.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {intentGuides.map((guide) => (
            <article key={guide.slug} className="surface-card h-full p-6 sm:p-7">
              <div className="section-eyebrow">{guide.kicker}</div>
              <h2 className="mt-5 text-3xl font-semibold text-ink">{guide.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">{guide.description}</p>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href={`/${guide.slug}`}>
                    <span className="inline-flex items-center gap-2">
                      Read guide
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
                Ready to compare the guides against a real sample?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                The cleanest way to evaluate Frithly is to request a brief tailored to your ICP,
                then compare it to the quality your team gets today.
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
