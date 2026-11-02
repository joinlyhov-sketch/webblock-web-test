import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DotGrid } from "./decor";

/**
 * Dot-grid backdrop shared by the hero copy and the showcase below it (Figma "Decor · Hero dot
 * grid"), with the "Bottom fade" into the next section.
 */
export function HeroBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden">
      <DotGrid className="-z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-25 bg-linear-to-b from-transparent to-background"
      />
      {children}
    </div>
  );
}

/** Hero copy (Figma "Hero copy"). The fixed header floats over its top padding. */
export function HeroSection() {
  return (
    <section className="relative isolate px-4 pt-32 pb-8 sm:px-6 sm:pt-40 lg:pt-46 lg:pb-10">
      {/* "Copy glow": keeps the dots quiet behind the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-[700px] w-[min(1200px,100%)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--color-background)_35%,transparent_70%)]"
      />

      {/*
        Above the fold, so CSS animations instead of `Reveal`: they play on first paint, without
        waiting for hydration. The headline is not animated at all, so it is visible straight away.
      */}
      <div className="mx-auto flex max-w-[960px] flex-col items-center gap-6 text-center">
        <h1 className="text-[clamp(2.25rem,1.4rem+3.6vw,4rem)] leading-[1.125] font-semibold tracking-[-0.02em] text-foreground">
          A professional website for your business,{" "}
          <span className="text-brand-strong">without the agency.</span>
        </h1>
        <p className="text-base leading-7 text-foreground-soft motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-lg">
          Pick a template, add your details, publish in minutes.
        </p>
        <div className="flex w-full flex-col items-stretch gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lp-lg">
            <Link href="/register">Build your website free</Link>
          </Button>
          <Button asChild variant="outline" size="lp-lg">
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
        <p className="text-base text-foreground-soft motion-safe:animate-fade-up motion-safe:[animation-delay:240ms]">
          Free for 14 days.
        </p>
      </div>
    </section>
  );
}
