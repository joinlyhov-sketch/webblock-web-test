import { Marquee } from "@/components/common/motion";
import { BrowserMock, showcaseTemplates, TemplateThumb } from "./template-mock";

/** The template shown in the hero's browser window. */
const heroTemplate = showcaseTemplates.find((t) => t.slug === "cold-brew-co") ?? showcaseTemplates[0];

// Three passes of the seven templates so one marquee copy is wider than an ultra-wide screen.
const marqueeTemplates = [...showcaseTemplates, ...showcaseTemplates, ...showcaseTemplates];

/**
 * "Websites built with WebBlock": a slow marquee of template thumbnails (pauses on hover) with the
 * Café cream site (Cold Brew Co) in a browser window overlapping the bottom of its cards from md up.
 */
export function HeroShowcase() {
  return (
    <section aria-label="Websites built with WebBlock" className="relative pb-6 md:pb-12">
      {/* White band behind the slider row so the hero dot grid never shows around the cards. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[140px] bg-background mask-[linear-gradient(to_bottom,transparent,black_24px,black_calc(100%-24px),transparent)] md:top-2 md:h-[218px]"
      />
      <Marquee
        duration={60}
        className="pt-4 motion-safe:animate-fade-up motion-safe:[animation-delay:320ms] mask-[linear-gradient(to_right,transparent_1.3%,black_12.7%,black_87.3%,transparent_98.7%)] md:pt-12"
        trackClassName="gap-4 pr-4 md:gap-6 md:pr-6"
      >
        {marqueeTemplates.map((template, i) => (
          <TemplateThumb key={`${template.slug}-${i}`} template={template} />
        ))}
      </Marquee>
      {/* Not animated: an opacity animation on an ancestor stops the frame's backdrop blur. */}
      <div className="relative z-10 mx-auto mt-6 w-full max-w-[820px] px-4 sm:px-6 md:-mt-[44px] md:px-0">
        <BrowserMock template={heroTemplate} preload />
      </div>
    </section>
  );
}
