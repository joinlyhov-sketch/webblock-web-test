import type { ReactNode } from "react";
import Image from "next/image";
import { AuthLogo } from "./auth-logo";
import { AuthShowcase, type Headline } from "./auth-showcase";

/** Two-column auth frame: logo + centred 424px form on the left, marketing panel on the right. */
export function AuthShell({ headline, children }: { headline: Headline; children: ReactNode }) {
  return (
    <div className="relative max-lg:ml-[calc(100vw-100%)] flex min-h-dvh gap-6 overflow-hidden bg-background p-4 sm:p-6">
      <Deco />
      <div className="relative flex min-w-0 flex-1 flex-col px-2 py-2 sm:px-8">
        <AuthLogo />
        <main className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="flex w-full max-w-[424px] flex-col gap-[18px] motion-safe:animate-fade-up">{children}</div>
        </main>
      </div>
      <AuthShowcase headline={headline} />
    </div>
  );
}

/**
 * Figma "Deco" (917×1192 SVG): dot grids in the top part, two rings centred at (180, 1012).
 * The Figma frame is 1117px tall, so pinning the whole SVG to the top only looks right at that
 * height. Instead it is shown as two clipped slices: dots pinned to the top, rings pinned to the
 * bottom with the ring centre 81px above the bottom edge — the same spot as in Figma.
 * Both hide on short screens, where they would sit behind the form.
 */
function Deco() {
  const svg = (
    <Image src="/images/auth/deco.svg" alt="" width={917} height={1192} className="absolute top-0 left-0 max-w-none" />
  );
  const slice =
    "pointer-events-none absolute -left-[109px] w-[917px] overflow-hidden max-sm:hidden motion-safe:animate-fade-in-slow [@media(max-height:820px)]:hidden";
  return (
    <div aria-hidden className="pointer-events-none max-lg:absolute max-lg:inset-0">
      {/* SVG y 0–820: dots. */}
      <div className={`${slice} top-6 h-[820px]`}>{svg}</div>
      {/* SVG y 820–1192: rings. Bottom −99px puts the ring centre (y 1012) 81px above the page bottom. */}
      <div className={`${slice} -bottom-[99px] h-[372px] [&>img]:-top-[820px]`}>{svg}</div>
    </div>
  );
}
