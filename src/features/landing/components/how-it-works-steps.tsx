"use client";

import { Tracked, tl } from "./how-it-works-timeline";

const steps = [
  {
    title: "Choose a template",
    text: "Start from a ready-made design with all seven blocks already in place.",
  },
  {
    title: "Customize your website",
    text: "Change text, images, colors and layout, or ask WebBlock AI to do it for you.",
  },
  {
    title: "Deploy",
    text: "Go live in minutes on your free webblock.com address.",
  },
];

/**
 * The three-step rail (Figma 5574:226054). A brand-tinted card slides behind the step the demo is
 * showing. Rows share one height (`auto-rows-fr`) so the card can move in whole-row percentages at any width.
 */
export function HowItWorksSteps() {
  return (
    <ol className="relative grid auto-rows-fr">
      <Tracked
        aria-hidden
        tracks={tl.activeCard}
        className="absolute top-0 right-0 left-[54px] h-1/3 rounded-[20px] bg-brand-soft shadow-hiw-step"
      />
      {steps.map((step, i) => {
        const number = String(i + 1).padStart(2, "0");
        return (
          <li key={step.title} className="relative flex gap-[18px]">
            <div aria-hidden className="flex flex-col items-center gap-1.5">
              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
                {number}
                <Tracked
                  tracks={tl.nodeActive[i]}
                  className="absolute inset-0 flex items-center justify-center bg-brand text-primary-foreground"
                >
                  {number}
                </Tracked>
              </span>
              {i < steps.length - 1 && (
                <span className="relative w-0.5 flex-1 overflow-hidden rounded-[1px] bg-border">
                  <Tracked
                    tracks={tl.railProgress[i]}
                    className="absolute inset-x-0 -top-full h-full rounded-[1px] bg-brand"
                  />
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-[18px] pt-3.5 pb-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="text-[15px] leading-[22px] text-muted-foreground">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
