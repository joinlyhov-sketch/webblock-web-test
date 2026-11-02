import { Reveal } from "@/components/common/motion";
import { Diamond, DotGrid } from "./decor";
import { EditorDemo } from "./editor-demo";

/** Figma diamond positions: left as % of the 1728px frame, top in px, size of the square. */
const diamonds = [
  { left: "20.8%", top: 163, size: 10 },
  { left: "79.9%", top: 142, size: 12 },
  { left: "94.9%", top: 310, size: 14 },
  { left: "5.2%", top: 552, size: 12 },
  { left: "8.7%", top: 990, size: 14 },
  { left: "92.6%", top: 1093, size: 10 },
  { left: "95.5%", top: 553, size: 10 },
];

/** "Blocks": headline over the looping editor demo (Figma "04 Seven blocks"). */
export function EditorSection() {
  return (
    <section
      id="blocks"
      aria-labelledby="blocks-title"
      className="relative scroll-mt-24 overflow-hidden bg-muted py-16 sm:py-24 lg:py-[120px]"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[1222px]">
        <DotGrid />
      </div>
      {diamonds.map((d, i) => (
        <span key={i} aria-hidden className="absolute hidden sm:block" style={{ left: d.left, top: d.top }}>
          <Diamond size={d.size} delay={i * 0.4} />
        </span>
      ))}

      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-10 px-4 sm:px-6 lg:gap-14 lg:px-8">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm leading-5 font-semibold tracking-[1.12px] text-brand-strong uppercase">
            Blocks
          </p>
          <h2
            id="blocks-title"
            className="text-[clamp(2rem,1.2rem+3.4vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground"
          >
            Start with an idea. Build something great.
          </h2>
          <p className="text-base leading-7 text-foreground-soft sm:text-lg">
            Drag blocks into place, or ask WebBlock AI to change them.
          </p>
        </Reveal>

        <Reveal y={24} delay={0.1} className="w-full">
          <p className="sr-only">
            Demo: in the WebBlock editor a Text block is dragged onto the page, then WebBlock AI is
            asked to make the hero heading warmer and rewrites it.
          </p>
          <div aria-hidden className="flex justify-center">
            <EditorDemo />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
