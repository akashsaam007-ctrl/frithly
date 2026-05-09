import { BrandMark } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";

export default function PublicLoading() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#050c14] px-6 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,179,142,0.16),transparent_24rem),radial-gradient(circle_at_75%_22%,rgba(94,134,171,0.12),transparent_28rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.18]" />
      <div className="relative flex max-w-lg flex-col items-center gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 text-center shadow-[0_32px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
        <BrandMark
          className="h-14 w-14 rounded-[1.2rem] border-white/10 bg-white/[0.08] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
          imageClassName="h-full w-full rounded-[0.95rem]"
          priority
        />
        <Spinner className="text-[#f0b38e]" />
        <div className="space-y-2">
          <h1 className="text-3xl text-[#fff7f1] md:text-4xl">Loading Frithly</h1>
          <p className="text-white/62">
            Preparing the outbound intelligence experience.
          </p>
        </div>
      </div>
    </main>
  );
}
