import { X } from "lucide-react";
import { Container } from "@/components/ui/container";

const bullets = [
  "Half the emails bounce",
  "Every lead looks the same — name, title, generic email",
  "Your SDRs spend 10+ hours/week researching before they can send anything",
  "When they skip the research, reply rates fall off a cliff",
  "You're sending 500 emails to book 2 meetings",
];

export function Problem() {
  return (
    <section id="problem" className="bg-white py-20">
      <Container width="narrow" className="space-y-8">
        <div className="space-y-4">
          <h2>Your sales team is drowning.</h2>
          <p>
            You&apos;re paying £300/month for Apollo. Or ZoomInfo. Or Lusha. Maybe all three.
          </p>
          <p>And yet:</p>
        </div>

        <ul className="space-y-4">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
                <X className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base text-ink md:text-lg">{bullet}</span>
            </li>
          ))}
        </ul>

        <p className="pt-4 text-lg italic text-muted">
          The problem isn&apos;t your team. It&apos;s that you&apos;re working with raw lists when you
          need researched intelligence.
        </p>
      </Container>
    </section>
  );
}
