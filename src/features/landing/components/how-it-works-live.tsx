import Image from "next/image";
import { Copy, Edit2, ExportSquare, Lock1 } from "iconsax-reactjs";
import { RealSize, Tracked, tl } from "./how-it-works-timeline";

// Screen 03 · "Website live" (Figma 5574:227643): blurred scrim + success modal. The modal is
// authored at real size (540 × 453) and shown at scale 11/27.

const MODAL_SCALE = 220 / 540;
const ASSETS = "/landing/how-it-works";

// [left, top, side] in real px, and which blink-in track each diamond follows.
const modalDiamonds: [number, number, number, 0 | 1 | 2][] = [
  [152, 39, 10, 0],
  [392, 48, 11, 1],
  [114, 146, 8, 2],
  [438, 136, 9, 0],
  [184, 19, 7, 1],
];

export function LiveScreen() {
  return (
    <Tracked tracks={tl.live} className="absolute inset-0">
      <div className="absolute inset-0 bg-hiw-scrim/34 backdrop-blur-[5.7px]" />
      <Tracked tracks={tl.successModal} className="absolute top-[111px] left-[242px] h-[184px] w-[220px]">
        <RealSize width={540} height={453} scale={MODAL_SCALE}>
          <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[28px] border border-border bg-background pt-[41px] shadow-hiw-modal">
            <div aria-hidden className="absolute inset-0">
              <div className="absolute top-[-114px] left-[-50px] h-[360px] w-[640px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-soft)_95%,transparent),color-mix(in_srgb,var(--color-primary-soft)_45%,transparent)_50%,transparent)]" />
              <Tracked tracks={tl.modalDots} className="absolute inset-x-0 top-0 h-[200px]">
                <div className="size-full bg-[radial-gradient(circle,var(--color-hiw-drag)_1.5px,transparent_1.6px)] bg-size-[22px_22px] opacity-[0.14] mask-[radial-gradient(closest-side,black,transparent)]" />
              </Tracked>
              {modalDiamonds.map(([left, top, side, blink], i) => (
                <Tracked
                  key={i}
                  tracks={tl.modalDiamonds[blink]}
                  className="absolute rotate-45 rounded-[2px] bg-hiw-diamond"
                  style={{ left, top, width: side, height: side }}
                />
              ))}
              <Tracked tracks={tl.modalSpark} className="absolute top-10 left-[314px] size-2 rounded-full bg-success" />
            </div>
            <Tracked tracks={tl.successChip} className="relative size-[84px] rounded-full bg-background shadow-hiw-success">
              <Tracked tracks={tl.successHalo} className="absolute inset-0">
                <Image src={`${ASSETS}/success-pulse-halo.svg`} width={32} height={32} alt="" className="size-full max-w-none" />
              </Tracked>
              <Image src={`${ASSETS}/success-icon-bg.svg`} width={25} height={25} alt="" className="absolute top-[11px] left-[11px] size-[62px]" />
              <Image src={`${ASSETS}/success-icon.svg`} width={14} height={14} alt="" className="absolute top-[25px] left-[25px] size-[34px]" />
            </Tracked>
            <p className="relative mt-6 w-[458px] text-center font-heading text-[34px] leading-[41px] font-semibold tracking-[-1.3px] text-brand-dark">
              Your website is live!
            </p>
            <p className="relative mt-2 text-center text-[17px] leading-[25.5px] text-muted-foreground">
              Customers can now visit Petal &amp; Stem at
            </p>
            <div className="relative mt-4 flex gap-2">
              <span className="flex h-12 items-center gap-2.5 rounded-full border border-border bg-background px-[18px] text-base leading-6 font-bold text-foreground">
                <Lock1 className="size-[17px] text-muted-foreground" />
                petalandstem.webblock.com
              </span>
              <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-foreground">
                <Copy className="size-[17px]" />
              </span>
            </div>
            <div className="relative mt-6 flex gap-2.5 text-[15px] leading-[22.5px] font-semibold">
              <span className="flex h-[50px] items-center gap-2.5 rounded-full bg-brand px-6 text-primary-foreground shadow-hiw-cta">
                <ExportSquare className="size-[18px]" />
                Visit your website
              </span>
              <span className="flex h-[50px] items-center gap-2.5 rounded-full border border-border bg-background px-6 text-foreground shadow-button">
                <Edit2 className="size-[18px]" />
                Back to editor
              </span>
            </div>
            <span className="relative mt-4 flex h-8 items-center rounded-full border border-border bg-background px-3 text-[13px] font-semibold text-foreground shadow-button">
              Go to dashboard
            </span>
          </div>
        </RealSize>
      </Tracked>
    </Tracked>
  );
}
