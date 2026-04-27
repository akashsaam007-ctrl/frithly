import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { PricingSection } from "@/components/landing/pricing";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  description: "Frithly pricing for B2B teams that want researched intelligence, not raw lead lists.",
  title: "Pricing | Frithly",
};

export default function PricingPage() {
  return (
    <main>
      <section className="py-20 md:py-24">
        <Container width="narrow" className="text-center">
          <h1>Choose the right Frithly plan for your team.</h1>
          <p className="mt-6 text-muted">
            Weekly lead intelligence, personalized openers, and zero annual contracts.
          </p>
        </Container>
      </section>
      <PricingSection />
      <Guarantees />
      <FinalCta />
    </main>
  );
}
