type PlaceholderPageProps = {
  description: string;
  title: string;
};

export function PlaceholderPage({
  description,
  title,
}: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center gap-4 px-6 py-16">
      <span className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
        Frithly
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-slate-600">
        {description}
      </p>
    </main>
  );
}
