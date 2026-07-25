import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const logoFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
});

type LogoProps = {
  className?: string;
  href?: string;
  imageClassName?: string;
  priority?: boolean;
};

type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function Logo({ className, href = "/", imageClassName, priority = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Frithly home"
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 text-[#f3f1ea] transition-opacity hover:opacity-95",
        className,
      )}
    >
      <Image
        src="/frithly-icon.png"
        alt="Frithly"
        width={374}
        height={443}
        priority={priority}
        quality={100}
        unoptimized
        sizes="48px"
        className={cn("h-8 w-auto sm:h-9", imageClassName)}
      />
      <span className={cn(logoFont.className, "text-[1.35rem] font-bold tracking-[-0.035em] sm:text-[1.5rem]")}>
        Frithly
      </span>
    </Link>
  );
}

export function BrandMark({ className, imageClassName, priority = false }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b1520]/92 shadow-[0_18px_50px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <Image
        src="/frithly-icon.png"
        alt="Frithly mark"
        width={374}
        height={443}
        priority={priority}
        quality={100}
        unoptimized
        sizes="56px"
        className={cn("h-14 w-14 object-contain", imageClassName)}
      />
    </div>
  );
}
