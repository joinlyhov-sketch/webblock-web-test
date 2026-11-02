import { Suspense } from "react";
import { PricingSkeleton } from "@/components/common/page-skeleton";
import { listPublicPlans } from "../api";
import { CtaSection } from "./cta-section";
import { EditorSection } from "./editor-section";
import { FaqSection } from "./faq-section";
import { HeroBackdrop, HeroSection } from "./hero-section";
import { HeroShowcase } from "./hero-showcase";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingSection } from "./pricing-section";
import { TemplatesSection } from "./templates-section";

/** The landing page body (How it works sits under Templates). Header and footer come from the route layout. */
export function LandingView() {
  return (
    <>
      <HeroBackdrop>
        <HeroSection />
        <HeroShowcase />
      </HeroBackdrop>
      <TemplatesSection />
      <HowItWorksSection />
      <EditorSection />
      <Suspense fallback={<PricingSkeleton />}><PricingContent /></Suspense>
      <FaqSection />
      <CtaSection />
    </>
  );
}

async function PricingContent() {
  const plans = await listPublicPlans();
  return <PricingSection plans={plans.items} />;
}
