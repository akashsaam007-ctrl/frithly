import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { type ProofPage, proofPages } from "@/lib/proof-pages";
import { intentGuides } from "@/lib/intent-guides";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebPageSchema,
} from "@/lib/seo";

type ProofPageViewProps = {
  page: ProofPage;
};

export function ProofPageView({ page }: ProofPageViewProps) {
  const relatedGuides = intentGuides.filter((guide) => page.relatedGuideSlugs.includes(guide.slug));
  const relatedProof = proofPages.filter((item) => page.relatedProofSlugs.includes(item.slug));

  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Proof", path: ROUTES.PROOF },
          { name: page.title, path: `${ROUTES.PROOF}/${page.slug}` },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: page.description,
          path: `${ROUTES.PROOF}/${page.slug}`,
          title: page.title,
        })}
      />
      <StructuredData
        data={buildArticleSchema({
          description: page.description,
          path: `${ROUTES.PROOF}/${page.slug}`,
          title: page.title,
        })}
      />
      <StructuredData data={buildFaqSchema(page.faqs)} />

      <Container className="space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <div className="section-eyebrow">{page.kicker}</div>
            <div className="space-y-5">
              <h1 className="section-title max-w-[15ch] text-balance">{page.title}</h1>
              <p className="section-copy max-w-2xl">{page.description}</p>
            </div>
            <div className="rounded-3xl border border-terracotta/20 bg-terracotta/5 px-5 py-4 text-sm leading-7 text-muted">
              <span className="font-semibold text-ink">Trust note:</span> {page.disclaimer}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.SAMPLE}>
                  <span className="inline-flex items-center gap-2">
                    Request a free sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-card p-6 sm:p-7">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Representative setup
              </div>
              <p className="mt-4 text-base leading-8 text-ink md:text-lg">{page.summary}</p>

              <div className="mt-6 grid gap-3">
                {page.profile.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-stone-50 px-4 py-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink md:text-base">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card-dark p-6 sm:p-7">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
                What changed
              </div>
              <div className="mt-5 space-y-4">
                {page.outcomes.map((outcome) => (
                  <div
                    key={outcome.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                      {outcome.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{outcome.value}</div>
                    <p className="mt-2 text-sm leading-7 text-white/70">{outcome.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="surface-card h-full p-6 sm:p-7">
              <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-muted md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.points?.length ? (
                <ul className="mt-5 space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-ink md:text-base">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
          <div className="surface-card p-6 sm:p-7">
            <div className="section-eyebrow">Common questions</div>
            <div className="mt-5 space-y-2">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-border/70 py-2 last:border-b-0">
                  <summary className="cursor-pointer list-none py-4 text-base font-semibold text-ink marker:hidden md:text-lg">
                    {faq.question}
                  </summary>
                  <p className="pb-4 text-sm leading-7 text-muted md:text-base">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card p-6 sm:p-7">
              <div className="section-eyebrow">See your version</div>
              <h2 className="mt-5 text-3xl font-semibold text-ink">
                Want to compare this proof page to your actual ICP?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                The cleanest next step is to request a Frithly sample. You will see the same motion
                applied to your market, buyer, and targeting constraints.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href={ROUTES.SAMPLE}>Get a free 5-lead sample</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/pricing">Review plans</Link>
                </Button>
              </div>
            </div>

            {relatedGuides.length ? (
              <div className="surface-card p-6 sm:p-7">
                <div className="section-eyebrow">Related guides</div>
                <div className="mt-5 space-y-4">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/${guide.slug}`}
                      className="block rounded-2xl border border-border/70 bg-stone-50 px-4 py-4 transition-colors hover:border-terracotta/40"
                    >
                      <div className="font-semibold text-ink">{guide.title}</div>
                      <p className="mt-2 text-sm leading-7 text-muted">{guide.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedProof.length ? (
              <div className="surface-card p-6 sm:p-7">
                <div className="section-eyebrow">More proof pages</div>
                <div className="mt-5 space-y-4">
                  {relatedProof.map((item) => (
                    <Link
                      key={item.slug}
                      href={`${ROUTES.PROOF}/${item.slug}`}
                      className="block rounded-2xl border border-border/70 bg-stone-50 px-4 py-4 transition-colors hover:border-terracotta/40"
                    >
                      <div className="font-semibold text-ink">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </Container>
    </main>
  );
}
