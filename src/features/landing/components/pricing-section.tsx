import Image from "next/image";
import { ShieldTick, Tag } from "iconsax-reactjs";
import { Pop, Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import type { Plan } from "../types";
import { Diamond } from "./decor";
import { PlanCard } from "./plan-card";

/** Seconds between one plan card's entrance and the next. */
const CARD_STAGGER = 0.1;

/** "Simple pricing, 14 days free" (Figma "05 Pricing"). Plans come from `listPublicPlans()`. */
export function PricingSection({ plans }: { plans: Plan[] }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative isolate scroll-mt-28 overflow-hidden px-4 py-20 sm:px-6 lg:py-24">
      <PricingDecor />

      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
        <Reveal>
          <h2 id="pricing-title" className="text-center text-[clamp(2rem,1.5rem+2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.025em] text-foreground">
            Simple pricing, 14 days free
          </h2>
        </Reveal>

        {plans.length === 0 ? (
          <p className="rounded-[20px] border border-border bg-background px-6 py-10 text-center text-muted-foreground">
            Plans are being updated. Start your free trial now and choose a plan later.
          </p>
        ) : (
          <RevealGroup
            className="grid w-full max-w-[1260px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
            stagger={CARD_STAGGER}
          >
            {plans.map((plan, i) => (
              <RevealItem key={plan.id} y={32} scale={0.96} className="mx-auto w-full max-w-[400px] xl:max-w-none">
                {/* Each card's feature list ticks in once its card has mostly settled. */}
                <PlanCard plan={plan} lower={plans[i - 1]} featuresDelay={0.35 + i * CARD_STAGGER} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}

/** Bubbles, dashed paths and diamonds at the section edges. Only on wide screens, where there is room. */
function PricingDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden 2xl:block">
      <Pop className="absolute top-30 right-27" delay={0.2}>
        <span className="flex size-20 items-center justify-center rounded-full bg-linear-135 from-plan-plus-light to-brand-strong to-70% text-primary-foreground shadow-button-hover">
          <Tag variant="Outline" className="size-8" />
        </span>
      </Pop>
      <Image src="/landing/decor/dashed-path-right.svg" alt="" width={133} height={88} className="absolute top-[156px] right-[-21px]" />

      <Pop className="absolute top-[560px] left-[112px]" delay={0.4}>
        <span className="relative flex size-[84px] items-center justify-center rounded-full bg-background shadow-float">
          <span className="flex size-[60px] items-center justify-center rounded-full bg-brand-soft text-brand">
            <ShieldTick variant="Outline" className="size-7" />
          </span>
          <span className="absolute top-[62px] left-[62px] size-4 rounded-full border-[3px] border-background bg-success" />
        </span>
      </Pop>
      <Image src="/landing/decor/dashed-path-left.svg" alt="" width={130} height={210} className="absolute top-[396px] left-[-14px]" />

      <Diamond className="top-[103px] left-[360px]" size={10} />
      <Diamond className="top-[82px] right-[352px]" size={12} delay={0.6} />
      <Diamond className="top-[240px] left-[100px]" size={14} delay={1.2} />
      <Diamond className="top-[469px] right-[66px]" size={16} delay={0.3} />
      <Diamond className="top-[773px] right-[114px]" size={10} delay={0.9} />
      <Diamond className="top-[812px] left-[180px]" size={12} delay={1.5} />
    </div>
  );
}
