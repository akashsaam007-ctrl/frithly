import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#030406] px-6 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_18%),radial-gradient(circle_at_76%_18%,rgba(89,62,144,0.07),transparent_22%),linear-gradient(180deg,#020304_0%,#040508_38%,#030406_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:176px_176px] opacity-[0.03]" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-[1.75rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,11,15,0.94),rgba(3,4,6,0.995))] px-8 py-10 text-center shadow-[0_28px_84px_rgba(0,0,0,0.28)]">
        <Logo imageClassName="h-8 sm:h-9" priority />
        <Spinner className="text-white/72" />
        <div>
          <h1 className="text-[1.95rem] font-semibold tracking-[-0.04em] text-white md:text-[2.25rem]">
            Loading Frithly
          </h1>
        </div>
      </div>
    </main>
  );
}
