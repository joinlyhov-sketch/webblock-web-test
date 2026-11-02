import Link from "next/link";
import { Logo, LogoMark } from "@/components/common/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** WebBlock logo linking home. `compact` shows the mark only. */
export function BrandLogo({
  href,
  compact,
  className,
}: {
  href: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={siteConfig.name}
      className={cn(
        "flex items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
    >
      {compact ? <LogoMark className="h-8" /> : <Logo />}
    </Link>
  );
}
