import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const answerCards = [
  {
    answer:
      "Frithly is a B2B lead intelligence service that delivers weekly researched accounts, verified contacts, and personalized outreach angles instead of raw lead lists.",
    question: "What is Frithly?",
  },
  {
    answer:
      "It is built for founder-led outbound teams, early sales teams, and GTM operators who want better weekly pipeline execution without spending hours on manual research.",
    question: "Who is Frithly for?",
  },
  {
    answer:
      "Most teams get the first brief within 7 days, then receive a fresh Monday-ready lead batch every week, with mid-week refreshes on the Growth plan.",
    question: "How does Frithly work in practice?",
  },
];

export function AnswerEngineSection() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <Container className="space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Quick answers</div>
          <h2 className="section-title mt-5">
            The clearest way to understand Frithly in under a minute.
          </h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            If you are comparing Frithly to lead databases, SDR tooling, or manual list-building,
            these are the short answers most buyers look for first.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {answerCards.map((card) => (
            <article key={card.question} className="surface-card h-full p-6 sm:p-7">
              <h3 className="text-xl font-semibold text-ink">{card.question}</h3>
              <p className="mt-4 text-sm leading-7 text-muted md:text-base">{card.answer}</p>
            </article>
          ))}
        </div>

        <div className="text-center">
          <div className="flex flex-col items-center gap-3 text-sm font-semibold sm:flex-row sm:justify-center">
            <Link
              href={ROUTES.GUIDES}
              className="text-terracotta underline underline-offset-4"
            >
              Explore the full Frithly buying guides
            </Link>
            <Link
              href={ROUTES.PROOF}
              className="text-terracotta underline underline-offset-4"
            >
              Read representative proof pages
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
