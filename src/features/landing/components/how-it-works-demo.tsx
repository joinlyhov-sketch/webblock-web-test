"use client";

import Image from "next/image";
import { ScaleToFit } from "@/components/common/scale-to-fit";
import { ChooseTemplateScreen } from "./how-it-works-dialog";
import { CustomizeScreen } from "./how-it-works-editor";
import { LiveScreen } from "./how-it-works-live";
import { PublishingScreen } from "./how-it-works-publish";
import { Tracked, tl } from "./how-it-works-timeline";

/** The panel's 32px corner as a share of its 768 × 520 box, so it scales with the panel. */
const PANEL_RADIUS = "rounded-[4.167%/6.154%]";

/**
 * The looping product demo (Figma 5574:226145, 768 × 520): choose a template → restyle it in site
 * settings → deploy → live. Rendered at design size and scaled down to fit. The shadow sits on an underlay
 * because `ScaleToFit` clips. Must sit inside the section's `LoopStage`.
 */
export function HowItWorksDemo() {
  return (
    <div className="relative">
      <p className="sr-only">
        Demo: a template is picked in the “Start a new website” dialog, the editor’s site settings
        switch the colour palette to Bakery and the headings to the Editorial font, Deploy publishes the
        site step by step, and a “Your website is live!” message appears.
      </p>
      <div aria-hidden className={`absolute inset-0 ${PANEL_RADIUS} shadow-hiw-panel`} />
      <ScaleToFit width={768} height={520} className={PANEL_RADIUS}>
        <div aria-hidden>
          <div className="relative h-[520px] w-[768px] overflow-hidden rounded-[32px] border border-border bg-muted">
            <div className="absolute top-12 left-8 h-[407.44px] w-[704px] overflow-hidden rounded-[17.6px] border-[0.88px] border-border bg-background shadow-hiw-screen">
              <ChooseTemplateScreen />
              <CustomizeScreen />
              <PublishingScreen />
              <LiveScreen />
              <Ripple tracks={tl.ripples.useTemplate} left={135.8} top={330.1} />
              <Ripple tracks={tl.ripples.palette} left={610.5} top={197.5} />
              <Ripple tracks={tl.ripples.font} left={563.5} top={283.5} />
              <Ripple tracks={tl.ripples.deploy} left={649.5} top={12.5} />
              <Tracked tracks={tl.cursor} className="absolute top-[328.5px] left-[558.5px] h-[22px] w-[18px]">
                <Image
                  src="/landing/how-it-works/cursor.svg" width={32} height={32}
                  alt=""
                  className="size-8 max-w-none drop-shadow-hiw-cursor"
                />
              </Tracked>
            </div>
          </div>
        </div>
      </ScaleToFit>
    </div>
  );
}

function Ripple({
  tracks,
  left,
  top,
}: {
  tracks: (typeof tl.ripples)[keyof typeof tl.ripples];
  left: number;
  top: number;
}) {
  return (
    <Tracked
      tracks={tracks}
      className="absolute size-[22px] rounded-full bg-brand/28"
      style={{ left, top }}
    />
  );
}
