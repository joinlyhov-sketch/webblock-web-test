import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Official WebBlock artwork (public/brand). Both files share the mark's height, so the lockup's
// wordmark starts 1.08 mark-heights in — `LOGO_WORDMARK_INSET` lines text up under it.
const MARK = { src: "/brand/webblock-mark.svg", width: 1254, height: 1229 };
const LOCKUP = { src: "/brand/webblock-logo.svg", width: 5094, height: 1229 };
export const LOGO_WORDMARK_INSET = 1.08;

/** The mark alone: 2×2 blocks with the smiling block popping out. Size it with a height class. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={MARK.src}
      width={MARK.width}
      height={MARK.height}
      alt=""
      className={cn("h-[26px] w-auto max-w-none shrink-0", className)}
    />
  );
}

/** Mark + "WebBlock" wordmark side by side. `lg` is the footer size (40px tall). */
export function Logo({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <Image
      src={LOCKUP.src}
      width={LOCKUP.width}
      height={LOCKUP.height}
      alt={siteConfig.name}
      className={cn("w-auto max-w-none shrink-0", size === "lg" ? "h-10" : "h-8", className)}
    />
  );
}
