import { Space_Grotesk } from "next/font/google";
import { BrandMark, Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

export default function PublicLoading() {
  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-[#0c0e11] px-6 py-14 text-[#f3f1ea]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

      <div className="relative flex w-full max-w-xl flex-col items-center gap-6 overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] px-6 py-9 text-center shadow-[0_32px_100px_rgba(0,0,0,0.32)] sm:px-8 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
        <Logo imageClassName="h-8 sm:h-9" priority />
        <BrandMark
          className="h-14 w-14 rounded-[6px] border-[#262b31] bg-[#0c0e11]/78 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
          imageClassName="h-full w-full rounded-[3px]"
          priority
        />
        <Spinner className="text-[#f3f1ea]/72" />
        <div>
          <p className={cn(displayFont.className, "text-[2rem] font-semibold text-[#f3f1ea] sm:text-[2.35rem]")}>
            Loading Frithly
          </p>
        </div>
      </div>
    </main>
  );
}
