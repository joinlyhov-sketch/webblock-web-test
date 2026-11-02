import Link from "next/link";
import { Reveal } from "@/components/common/motion";
import { Button } from "@/components/ui/button";
import { Diamond, DotGrid } from "./decor";
import { TemplateCarousel } from "./template-carousel";

// Figma "Decor · style.jpg" diamonds, positioned as % of the 1728px frame. Some hide on phones.
const diamonds = [
  { className: "top-[290px] left-[7%]", size: 14, delay: 0 },
  { className: "top-[183px] left-[19%] hidden sm:block", size: 10, delay: 0.6 },
  { className: "top-[152px] left-[80.7%]", size: 12, delay: 1.2 },
  { className: "top-[549px] left-[94.9%] hidden sm:block", size: 16, delay: 0.3 },
  { className: "top-[693px] left-[85%] hidden md:block", size: 10, delay: 0.9 },
  { className: "top-[872px] left-[5.2%] hidden md:block", size: 12, delay: 1.5 },
  { className: "top-[903px] left-[93.2%] hidden md:block", size: 10, delay: 0.4 },
  { className: "top-[882px] left-[32.4%] hidden md:block", size: 12, delay: 1.1 },
];

/** "Different looks. One kind of site." 3D template carousel with style chips. */
export function TemplatesSection() {
  return (
    <section
      id="templates"
      aria-labelledby="templates-title"
      className="relative scroll-mt-24 overflow-hidden px-4 pt-16 pb-16 sm:px-6 md:pt-20 lg:px-8 lg:pb-24"
    >
      <DotGrid className="bottom-auto h-[92%]" />
      {diamonds.map((d) => (
        <Diamond key={d.className} className={d.className} size={d.size} delay={d.delay} />
      ))}

      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-4 md:gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal y={16}>
            <p className="text-sm leading-5 font-semibold tracking-[0.08em] text-brand-strong uppercase">
              Templates
            </p>
          </Reveal>
          <Reveal y={24} delay={0.1}>
            <h2
              id="templates-title"
              className="text-[clamp(2rem,4.5vw+0.5rem,3.5rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground"
            >
              Different looks. One kind of site.
            </h2>
          </Reveal>
        </div>

        <TemplateCarousel />

        <Reveal y={14} delay={0.2}>
          <Button asChild variant="outline" size="lp-lg">
            <Link href="/templates">Browse the catalogue</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
