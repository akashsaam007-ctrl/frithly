import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
};

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={`${APP_NAME} home`}
      className={cn(
        "inline-flex items-center gap-2 text-2xl font-bold tracking-tighter text-ink transition-colors hover:text-terracotta",
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-sm font-extrabold text-white">
        F
      </span>
      <span>{APP_NAME}</span>
    </Link>
  );
}
