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
        "inline-flex items-center rounded-2xl transition-opacity hover:opacity-90",
        className,
      )}
    >
      <Image
        src="/frithly-logo.png"
        alt="Frithly"
        width={1935}
        height={813}
        priority={priority}
        sizes="(min-width: 1280px) 220px, (min-width: 1024px) 200px, (min-width: 640px) 176px, 152px"
        className={cn("h-8 w-auto sm:h-9 md:h-10", imageClassName)}
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
        width={112}
        height={112}
        priority={priority}
        sizes="56px"
        className={cn("h-14 w-14 object-cover", imageClassName)}
      />
    </div>
  );
}
