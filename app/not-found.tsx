import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="py-24">
      <Container width="narrow" className="space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          404
        </p>
        <h1>That page slipped through the cracks.</h1>
        <p className="text-muted">
          The link may be out of date, or the page may have moved while we were shipping the next
          Frithly update.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href={ROUTES.HOME}>Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={ROUTES.SAMPLE}>Request a free sample</Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
