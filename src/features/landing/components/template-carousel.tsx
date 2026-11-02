"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Carousel3DItem } from "@/components/common/carousel-3d";
import { RevealGroup, RevealItem, useInView } from "@/components/common/motion";
import { cn } from "@/lib/utils";
import { BrowserMock, showcaseTemplates } from "./template-mock";

const stageClass = "h-[300px] w-full sm:h-[400px] md:h-[480px] lg:h-[560px]";

// WebGL only exists in the browser, so the three.js carousel loads on the client.
const Carousel3D = dynamic(() => import("@/components/common/carousel-3d").then((m) => m.Carousel3D), {
  ssr: false,
  loading: () => <div aria-hidden className={stageClass} />,
});

const items: Carousel3DItem[] = showcaseTemplates.map((template) => ({
  id: template.slug,
  label: template.name,
  imageSrc: template.image.src,
  aspect: template.image.width / template.image.height,
}));

/** Plates starts in the middle of the fan. */
const START = showcaseTemplates.findIndex((template) => template.slug === "plates");

/**
 * The templates as a 3D ring. Clicking a card (or dragging) turns it to the front; the style
 * chips below do the same and are the keyboard and screen-reader controls. Preview only: it does
 * not filter anything.
 */
export function TemplateCarousel() {
  const [active, setActive] = useState(START);
  const current = showcaseTemplates[active];
  // three.js (~140 KB gzipped) and its WebGL setup wait until the section is about to scroll in,
  // so they stay off the main thread while the page first loads. Keep the margin small: on phones
  // the stage starts only ~300px below the fold.
  const stageRef = useRef<HTMLDivElement>(null);
  const nearView = useInView(stageRef, { once: true, margin: "100px 0px" });

  return (
    <div className="flex w-full flex-col items-center gap-6 md:gap-8">
      {nearView ? (
        <Carousel3D
          items={items}
          activeIndex={active}
          onSelect={setActive}
          className={cn(stageClass, "cursor-grab active:cursor-grabbing")}
          fallback={
            <div className="mx-auto w-full max-w-[720px]">
              <BrowserMock template={current} />
            </div>
          }
        />
      ) : (
        <div ref={stageRef} aria-hidden className={stageClass} />
      )}

      <RevealGroup className="flex flex-wrap justify-center gap-2" stagger={0.08}>
        {showcaseTemplates.map((template, index) => {
          const selected = index === active;
          return (
            <RevealItem key={template.slug} y={14}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(index)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors outline-none sm:px-5 sm:py-2.5 sm:text-base",
                  "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
                  selected
                    ? "bg-brand text-primary-foreground shadow-button"
                    : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
                )}
              >
                {template.style}
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
