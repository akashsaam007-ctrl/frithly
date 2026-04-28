import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner className="text-terracotta" />
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl">Loading Frithly</h1>
          <p className="text-muted">
            Pulling in your leads, feedback, and account details.
          </p>
        </div>
      </div>
    </main>
  );
}
