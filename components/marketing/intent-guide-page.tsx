import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { type IntentGuide, intentGuides } from "@/lib/intent-guides";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebPageSchema,
} from "@/lib/seo";

type IntentGuidePageProps = {
  guide: IntentGuide;
};

export function IntentGuidePage({ guide }: IntentGuidePageProps) {
  const relatedGuides = intentGuides.filter((item) => guide.relatedSlugs.includes(item.slug));

  return (
    <main className="py-16 sm:py-20 lg:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/${guide.slug}` },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: guide.description,
          path: `/${guide.slug}`,
          title: guide.title,
        })}
      />
      <StructuredData data={buildFaqSchema(guide.faqs)} />

      <Container className="space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <div className="section-eyebrow">{guide.kicker}</div>
            <div className="space-y-5">
              <h1 className="section-title max-w-[14ch] text-balance">{guide.title}</h1>
              <p className="section-copy max-w-2xl">{guide.description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.SAMPLE}>
                  <span className="inline-flex items-center gap-2">
                    Get a free 5-lead sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>

          <aside className="surface-card p-6 sm:p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              Short answer
            </div>
            <p className="mt-4 text-base leading-8 text-ink md:text-lg">{guide.answer}</p>

            <div className="mt-6 space-y-3">
              {guide.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-stone-50 px-4 py-4 text-sm text-ink md:text-base"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {guide.sections.map((section) => (
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
                      <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-terracotta" />
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
              {guide.faqs.map((faq) => (
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
              <div className="section-eyebrow">Best next step</div>
              <h2 className="mt-5 text-3xl font-semibold text-ink">
                See the output before you commit to a plan.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                The easiest way to judge fit is to request a tailored sample against your ICP and
                compare the quality to what your team is producing today.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href={ROUTES.SAMPLE}>Request a free sample</Link>
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
                  {relatedGuides.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/${item.slug}`}
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
