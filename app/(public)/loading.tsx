import { BrandMark, Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";

export default function PublicLoading() {
  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-[#030406] px-6 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_18%),radial-gradient(circle_at_80%_16%,rgba(89,62,144,0.08),transparent_20%),radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.03),transparent_26%),linear-gradient(180deg,#020304_0%,#040508_24%,#06080d_58%,#030406_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:184px_184px] opacity-[0.035]" />
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(167,139,250,0.05),transparent)] lg:block" />

      <div className="relative flex w-full max-w-xl flex-col items-center gap-6 rounded-[1.9rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,11,15,0.94),rgba(3,4,6,0.995))] px-6 py-9 text-center shadow-[0_32px_100px_rgba(0,0,0,0.32)] sm:px-8 sm:py-10">
        <Logo imageClassName="h-8 sm:h-9" priority />
        <BrandMark
          className="h-14 w-14 rounded-[1.15rem] border-white/[0.08] bg-white/[0.03] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
          imageClassName="h-full w-full rounded-[0.95rem]"
          priority
        />
        <Spinner className="text-white/72" />
        <div className="space-y-2.5">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.35rem]">
            Loading Frithly
          </h1>
          <p className="mx-auto max-w-md text-[0.98rem] leading-8 text-white/58">
            Preparing the next view in the same black-enterprise experience.
          </p>
        </div>
      </div>
    </main>
  );
}
