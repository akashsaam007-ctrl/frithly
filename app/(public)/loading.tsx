import { BrandMark } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";

export default function PublicLoading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="surface-card flex max-w-lg flex-col items-center gap-5 px-8 py-10 text-center">
        <BrandMark
          className="h-14 w-14 rounded-[1.2rem] border-border/70 bg-white p-1.5 shadow-sm"
          imageClassName="h-full w-full rounded-[0.95rem]"
          priority
        />
        <Spinner className="text-terracotta" />
        <div className="space-y-2">
          <h1 className="text-3xl text-ink md:text-4xl">Loading Frithly</h1>
          <p className="text-muted">
            Preparing the weekly outbound intelligence experience.
          </p>
        </div>
      </div>
    </main>
  );
}
