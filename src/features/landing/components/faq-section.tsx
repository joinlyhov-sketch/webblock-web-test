import { ArrowRight, Message, MessageQuestion } from "iconsax-reactjs";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { CONTACT_HASH, faqItems } from "../content";
import { Diamond, DotGrid, GlassOrb } from "./decor";

const supportHref = CONTACT_HASH;

/** "Questions owners ask us." (Figma "06 FAQ"): help card + accordion (first item open). */
export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative isolate scroll-mt-28 overflow-hidden bg-muted px-4 py-20 sm:px-6 lg:py-24">
      <FaqDecor />

      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:flex-row lg:gap-16">
        <Reveal className="flex flex-col gap-7 lg:w-[400px] lg:shrink-0">
          <h2 id="faq-title" className="text-[clamp(2rem,1.6rem+1.6vw,2.5rem)] leading-[1.155] font-semibold tracking-[-0.0275em] text-foreground">
            Questions owners
            <br /> ask us.
          </h2>

          <div className="flex flex-col items-start gap-4 rounded-[22px] border border-background/90 bg-background p-[22px] shadow-soft">
            <span className="rounded-xl border border-background/80 bg-brand/10 p-2.5 text-brand">
              <Message aria-hidden className="size-5" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">Still have a question?</h3>
            <p className="text-[15px] leading-7 text-foreground-soft">
              Anything else? Email us at{" "}
              <a href={supportHref} className="text-brand-strong underline underline-offset-2 hover:text-brand-dark">
                {siteConfig.supportEmail}
              </a>
              .
            </p>
            <Button asChild size="lp-md">
              <a href={supportHref}>
                Mail to us <ArrowRight aria-hidden className="size-3.5!" />
              </a>
            </Button>
          </div>
        </Reveal>

        <RevealGroup className="min-w-0 flex-1">
          <Accordion type="single" collapsible defaultValue="faq-0" className="flex flex-col gap-2.5">
            {faqItems.map((item, i) => (
              <RevealItem key={item.question} y={12}>
                <AccordionItem value={`faq-${i}`} className="rounded-[14px] border-b-0 bg-background px-5 py-[18px]">
                  <AccordionTrigger className="items-center gap-3.5 py-0 text-lg font-normal text-foreground data-[state=open]:text-brand [&>svg]:size-5 [&>svg]:translate-y-0">
                    <MessageQuestion aria-hidden className="size-5 shrink-0 text-brand" />
                    <span className="flex-1">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2.5 pb-0 pl-[34px] text-base text-foreground-soft">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </RevealItem>
            ))}
          </Accordion>
        </RevealGroup>
      </div>
    </section>
  );
}

function FaqDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <DotGrid />
      <GlassOrb color="blue" size={360} className="top-[180px] left-[22%]" />
      <GlassOrb color="lavender" size={420} className="top-10 left-[61%]" />
      <GlassOrb color="mint" size={300} className="top-[300px] left-[75%]" />
      <Diamond className="top-[132px] left-[110px] hidden md:block" size={12} />
      <Diamond className="top-[413px] left-[160px] hidden md:block" size={10} delay={0.8} />
      <Diamond className="top-[390px] right-[68px] hidden md:block" size={14} delay={0.4} />
      <Diamond className="top-[513px] right-[134px] hidden md:block" size={10} delay={1.2} />
    </div>
  );
}
