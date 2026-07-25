import { Space_Grotesk } from "next/font/google";
import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

export default function Loading() {
  return (
    <main className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[#0c0e11] px-6 py-20 text-[#f3f1ea]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-5 overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] px-8 py-10 text-center shadow-[0_28px_84px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
        <Logo imageClassName="h-8 sm:h-9" priority />
        <Spinner className="text-[#f3f1ea]/72" />
        <div>
          <p className={cn(displayFont.className, "text-[1.95rem] font-semibold text-[#f3f1ea] md:text-[2.25rem]")}>
            Loading Frithly
          </p>
        </div>
      </div>
    </main>
  );
}
