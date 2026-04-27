import { Container } from "@/components/ui/container";

type PlaceholderPageProps = {
  description: string;
  title: string;
};

export function PlaceholderPage({
  description,
  title,
}: PlaceholderPageProps) {
  return (
    <main className="py-24 md:py-32">
      <Container width="narrow" className="card flex min-h-[24rem] flex-col justify-center gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          Frithly
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">{description}</p>
      </Container>
    </main>
  );
}
