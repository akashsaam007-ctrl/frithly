import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-95",
        className,
      )}
    >
      <Image
        src="/frithly-logo.png"
        alt="Frithly"
        width={1935}
        height={813}
        priority={priority}
        quality={100}
        unoptimized
        sizes="(min-width: 1280px) 220px, (min-width: 1024px) 200px, (min-width: 640px) 176px, 152px"
        className={cn("h-[2.05rem] w-auto sm:h-[2.3rem] md:h-[2.45rem]", imageClassName)}
      />
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
        src="/frithly-mark.png"
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
