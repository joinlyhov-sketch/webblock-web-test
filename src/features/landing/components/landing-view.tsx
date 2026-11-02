import type { Plan } from "../types";
import { CtaSection } from "./cta-section";
import { EditorSection } from "./editor-section";
import { FaqSection } from "./faq-section";
import { HeroBackdrop, HeroSection } from "./hero-section";
import { HeroShowcase } from "./hero-showcase";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingSection } from "./pricing-section";
import { TemplatesSection } from "./templates-section";

/** The landing page body (How it works sits under Templates). Header and footer come from the route layout. */
export function LandingView({ plans }: { plans: Plan[] }) {
  return (
    <>
      <HeroBackdrop>
        <HeroSection />
        <HeroShowcase />
      </HeroBackdrop>
      <TemplatesSection />
      <HowItWorksSection />
      <EditorSection />
      <PricingSection plans={plans} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
