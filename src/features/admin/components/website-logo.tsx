import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** A template's own mark: what its header shows until the owner uploads a logo. */
const DEFAULT_MARKS: Record<string, ReactNode> = {
  "everyday-store": <span>❀</span>,
  "sweet-pastel": <span>✧</span>,
  "warm-bold": <span>◉</span>,
  "clean-mono": <span>▲</span>,
  keyboards: <span className="size-[0.45em] rounded-full bg-current" />,
  "iced-coffee": (
    <svg viewBox="0 0 24 24" className="size-[0.9em]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h12l-1.4 12.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8L6 7Z" />
      <path d="M5 7h14M10 4h4l1 3" />
    </svg>
  ),
  jackets: (
    <svg viewBox="0 0 24 24" className="size-[0.9em]" fill="currentColor">
      <path d="M8 3 3 7l1.5 4L7 10v11h10V10l2.5 1L21 7l-5-4-1.5 2h-5z" />
    </svg>
  ),
  plates: (
    <svg viewBox="0 0 24 24" className="size-[0.9em]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
};

/**
 * A website's profile picture in admin lists and popups: the logo the owner uploaded in Business
 * information, otherwise the default mark of the template the site was built from.
 */
export function WebsiteLogo({
  logoUrl,
  templateSlug,
  className,
}: {
  logoUrl?: string | null;
  templateSlug?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-soft text-[18px] leading-none text-primary",
        className,
      )}
    >
      {logoUrl ? (
        // Uploaded logos can be data URLs, which the image optimizer can't fetch.
        <Image src={logoUrl} alt="" fill unoptimized sizes="128px" className="object-cover" />
      ) : (
        ((templateSlug && DEFAULT_MARKS[templateSlug]) ?? <span>❀</span>)
      )}
    </span>
  );
}
