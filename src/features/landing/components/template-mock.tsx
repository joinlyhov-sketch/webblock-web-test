import Image from "next/image";
import { Lock1 } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type ShowcaseTemplate = {
  slug: string;
  name: string;
  /** Style label used by the template chips. */
  style: string;
  domain: string;
  /** Screenshot of the template site's first screen; mocks show it from the top. */
  image: { src: string; width: number; height: number };
};

/** The sample sites shown in the hero marquee, the hero browser and the templates carousel. */
export const showcaseTemplates = [
  {
    slug: "petal-stem",
    name: "Petal & Stem",
    style: "Fresh & simple",
    domain: "petalandstem.webblock.com",
    image: { src: "/landing/templates/petal-stem-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "sugar-crumb",
    name: "Sugar & Crumb",
    style: "Candy pastel",
    domain: "sugarandcrumb.webblock.com",
    image: { src: "/landing/templates/sugar-crumb-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "kiln-coffee",
    name: "Kiln Coffee",
    style: "Rustic roast",
    domain: "kilncoffee.webblock.com",
    image: { src: "/landing/templates/kiln-coffee-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "northpoint-audio",
    name: "Northpoint Audio",
    style: "Studio mono",
    domain: "northpointaudio.webblock.com",
    image: { src: "/landing/templates/northpoint-audio-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "stitch-and-shell",
    name: "Stitch & Shell",
    style: "Street pop",
    domain: "stitchandshell.webblock.com",
    image: { src: "/landing/templates/stitch-and-shell-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "keycap-lab",
    name: "Keycap Lab",
    style: "Midnight glow",
    domain: "keycaplab.webblock.com",
    image: { src: "/landing/templates/keycap-lab-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "cold-brew-co",
    name: "Cold Brew Co",
    style: "Café cream",
    domain: "coldbrewco.webblock.com",
    image: { src: "/landing/templates/cold-brew-co-home.webp", width: 2560, height: 1584 },
  },
  {
    slug: "plates",
    name: "Plates",
    style: "Peach plates",
    domain: "plates.webblock.com",
    image: { src: "/landing/templates/plates-home.webp", width: 2560, height: 1584 },
  },
] as const satisfies readonly ShowcaseTemplate[];

/**
 * Top of a template screenshot, from the site's nav down. Transparent page backgrounds let the
 * browser frame's frosted glass show through, with a grey tint on top (as Figma).
 */
export function TemplateScreenshot({
  template,
  sizes,
  preload,
  eager,
  decorative,
  className,
}: {
  template: ShowcaseTemplate;
  sizes: string;
  /** Preload when the image is the hero's main (LCP) image. */
  preload?: boolean;
  /** Load immediately (above the fold) instead of lazily. */
  eager?: boolean;
  /** Empty alt for repeated thumbnails that add nothing for screen readers. */
  decorative?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={template.image.src}
        preload={preload}
        loading={eager ? "eager" : undefined}
        width={template.image.width}
        height={template.image.height}
        sizes={sizes}
        // Screenshots are mostly small text, which the default quality (75) smears.
        quality={90}
        alt={decorative ? "" : `${template.name} website built with the ${template.style} template`}
        className="absolute inset-0 size-full max-w-none object-cover object-top"
      />
    </div>
  );
}

/**
 * Small template card used in the hero marquee (above the fold, so loaded eagerly). White behind the
 * screenshot so the hero dot grid never shows through a transparent page.
 */
export function TemplateThumb({ template }: { template: ShowcaseTemplate }) {
  return (
    <TemplateScreenshot
      template={template}
      sizes="(min-width: 768px) 221px, 160px"
      eager
      decorative
      className="aspect-221/138 w-40 shrink-0 rounded-[10px] border border-foreground/8 bg-background md:w-[221px]"
    />
  );
}

/**
 * Template site in a browser window (Figma "Template mock"). `lg` is fluid up to 820px;
 * `sm` is the fixed 410px card used in the templates fan (exactly half of `lg`). The frame is clear
 * frosted glass, so whatever slides behind it (the hero marquee) stays visible, softly blurred.
 */
export function BrowserMock({
  template,
  size = "lg",
  preload,
  className,
}: {
  template: ShowcaseTemplate;
  size?: "lg" | "sm";
  preload?: boolean;
  className?: string;
}) {
  const lg = size === "lg";
  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden border-background/90 bg-browser-glass backdrop-blur-sm",
        lg
          ? "w-full max-w-[820px] rounded-[20px] border-[1.5px] px-2.5 pt-1 pb-2.5 shadow-browser"
          : "w-[410px] rounded-[10px] border-[0.75px] px-1 pt-0.5 pb-1 shadow-browser-sm",
        className,
      )}
    >
      <div className={cn("flex items-center", lg ? "h-[41px] gap-4 px-4" : "h-[20.5px] gap-2 px-2")}>
        <div aria-hidden className={cn("flex shrink-0", lg ? "gap-1.5" : "gap-1")}>
          {["bg-window-close", "bg-window-minimize", "bg-window-zoom"].map((color) => (
            <span key={color} className={cn("rounded-full", color, lg ? "size-2.5" : "size-[5px]")} />
          ))}
        </div>
        <div className={cn("flex min-w-0 flex-1 justify-center", lg && "pr-[42px]")}>
          <figcaption
            className={cn(
              "flex min-w-0 items-center border-border bg-background font-medium text-browser-url",
              lg
                ? "h-7 gap-1.5 rounded-md border px-3 text-xs leading-[18px]"
                : "h-3.5 gap-1 rounded-[3px] border-[0.5px] px-1.5 text-[6px] leading-[9px]",
            )}
          >
            <Lock1 variant="Outline" aria-hidden className={cn("shrink-0", lg ? "size-[11px]" : "size-[5.5px]")} />
            <span className="truncate">{template.domain}</span>
          </figcaption>
        </div>
      </div>
      <TemplateScreenshot
        template={template}
        sizes={lg ? "(min-width: 880px) 800px, 100vw" : "410px"}
        preload={preload}
        className={cn(
          "aspect-800/458 w-full bg-browser-page",
          lg ? "rounded-b-[10px]" : "rounded-b-[5px]",
        )}
      />
    </figure>
  );
}
