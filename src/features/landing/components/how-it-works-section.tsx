import Link from "next/link";
import { LoopStage, RevealGroup, RevealItem } from "@/components/common/motion";
import { Button } from "@/components/ui/button";
import { HowItWorksDemo } from "./how-it-works-demo";
import { HowItWorksSteps } from "./how-it-works-steps";

/** "How it works" stepper + looping product demo (Figma 5574:226037). */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="overflow-x-clip bg-background py-20 lg:py-[120px]"
    >
      <LoopStage className="mx-auto flex max-w-[1280px] flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:justify-between lg:gap-[72px] lg:px-8 xl:px-0">
        <div className="flex w-full max-w-[768px] flex-col gap-8 lg:w-[440px] lg:shrink-0">
          <RevealGroup className="flex flex-col gap-3.5">
            <RevealItem y={12}>
              <p className="text-sm leading-5 font-semibold tracking-[1.96px] text-brand-strong uppercase">
                How it works
              </p>
            </RevealItem>
            <RevealItem>
              <h2
                id="how-it-works-title"
                className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-[1.29] font-semibold tracking-[-1.12px] text-foreground"
              >
                Three steps to a live site.
              </h2>
            </RevealItem>
          </RevealGroup>
          <HowItWorksSteps />
          <RevealGroup className="flex flex-wrap items-center gap-4">
            <RevealItem y={12}>
              <Button asChild size="lp-lg">
                <Link href="/register">Start free</Link>
              </Button>
            </RevealItem>
            <RevealItem y={12}>
              <p className="text-base text-muted-foreground">14 days free, then pick a plan.</p>
            </RevealItem>
          </RevealGroup>
        </div>
        <div className="w-full max-w-[768px] lg:min-w-0 lg:flex-1">
          <HowItWorksDemo />
        </div>
      </LoopStage>
    </section>
  );
}
