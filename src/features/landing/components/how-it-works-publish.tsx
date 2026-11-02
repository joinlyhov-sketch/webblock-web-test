import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, Driver, Global, Refresh2, ShieldTick } from "iconsax-reactjs";
import { LogoMark } from "@/components/common/logo";
import { cn } from "@/lib/utils";
import { RealSize, Tracked, tl } from "./how-it-works-timeline";

// Screen 03 · "Deploying your changes" (Figma 5574:226620) at real size, shown at scale 11/27.

const PUBLISH_SCALE = 704 / 1728;
const ASSETS = "/landing/how-it-works";

export function PublishingScreen() {
  return (
    <Tracked tracks={tl.publishing} className="absolute inset-0">
      <RealSize width={1728} height={1000} scale={PUBLISH_SCALE}>
        <div className="relative h-full overflow-hidden bg-background">
          <Backdrop />
          <div className="relative flex h-[84px] items-center px-5">
            <span className="flex items-center rounded-full bg-background px-1.5 py-1 shadow-hiw-pill">
              <span className="flex h-8 items-center gap-2 px-3 text-[13px] font-semibold text-foreground-soft">
                <ArrowLeft variant="Outline" className="size-[15px]" />
                Back to editor
              </span>
            </span>
            <span className="flex-1" />
            <span className="flex items-center gap-2.5 rounded-full bg-background py-1.5 pr-4 pl-1.5 shadow-hiw-pill">
              <LogoMark className="h-[34px]" />
              <span className="flex flex-col">
                <span className="text-[13px] leading-[19.5px] font-semibold text-foreground">Petal &amp; Stem</span>
                <span className="text-xs leading-[18px] text-muted-foreground">Home page</span>
              </span>
            </span>
          </div>
          <div className="relative flex flex-col items-center pt-16">
            <ProgressRing />
            <span className="mt-5 flex h-6 items-center gap-1.5 rounded-full bg-brand-soft px-2.5 text-xs font-semibold text-brand-strong">
              <Refresh2 variant="Outline" className="size-[13px]" />
              Deploying · about 2 minutes left
            </span>
            <p className="mt-3 w-[560px] text-center font-heading text-[34px] leading-[46px] font-semibold tracking-[-1.1px] text-brand-dark">
              Deploying your changes
            </p>
            <p className="mt-2.5 w-[560px] text-center text-base leading-6 text-muted-foreground">
              Your current website stays online until the new version is ready.
            </p>
            <Tracked
              tracks={tl.stepsCard}
              className="mt-9 w-[1320px] overflow-hidden rounded-3xl border border-border bg-background pb-8 shadow-hiw-steps"
            >
              <div className="flex items-center justify-between border-b border-border px-8 py-5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-bold text-foreground">Deploy steps</span>
                  <span className="flex gap-1">
                    {["bg-brand", "bg-brand", "bg-brand", "bg-brand/35", "bg-border", "bg-border"].map((bar, i) => (
                      <span key={i} className={cn("h-1 w-[18px] rounded-[2px]", bar)} />
                    ))}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-muted-foreground">3 of 6 done</span>
              </div>
              <div className="flex px-2 pt-7">
                {deploySteps.map((step, i) => (
                  <Tracked key={step.title} tracks={tl.deploySteps[i]} className="flex flex-1 flex-col items-center">
                    <DeployStep {...step} first={i === 0} last={i === deploySteps.length - 1} />
                  </Tracked>
                ))}
              </div>
            </Tracked>
          </div>
        </div>
      </RealSize>
    </Tracked>
  );
}

function ProgressRing() {
  return (
    <div className="relative size-[120px]">
      <Image src={`${ASSETS}/ring-disc.svg`} width={81} height={81} alt="" className="absolute top-[-24px] left-[-40px] size-[200px] max-w-none" />
      <Image src={`${ASSETS}/ring-track.svg`} width={49} height={49} alt="" className="absolute inset-0 size-full" />
      <Image src={`${ASSETS}/ring-progress.svg`} width={45} height={49} alt="" className="absolute top-0 left-[9.3px] h-[120px] w-[110.7px] max-w-none" />
      <span className="absolute top-[41px] left-[30px] font-heading text-[30px] leading-[38px] font-semibold text-brand-dark">
        66%
      </span>
    </div>
  );
}

type DeployStatus = "done" | "current" | "pending";

const deploySteps: {
  title: string;
  text: string;
  meta: string;
  status: DeployStatus;
  icon?: ReactNode;
}[] = [
  { title: "Building your website", text: "Turning your design into a fast website", meta: "Done · 12s", status: "done" },
  { title: "Setting up your products", text: "Creating storage for products, prices and custom fields", meta: "Done · 8s", status: "done" },
  { title: "Packaging everything", text: "Preparing your site to run on our servers", meta: "Done · 41s", status: "done" },
  { title: "Launching your website", text: "Starting your website and its data service", meta: "In progress", status: "current", icon: <Driver variant="Outline" className="size-5" /> },
  { title: "Setting up petalandstem.webblock.com", text: "Adding the security padlock (SSL) to your free address", meta: "Up next", status: "pending", icon: <ShieldTick variant="Outline" className="size-5" /> },
  { title: "Live!", text: "Your website is open to customers", meta: "Waiting", status: "pending", icon: <Global variant="Outline" className="size-5" /> },
];

function DeployStep({
  title,
  text,
  meta,
  status,
  icon,
  first,
  last,
}: (typeof deploySteps)[number] & { first: boolean; last: boolean }) {
  const reached = status !== "pending";
  return (
    <>
      <div className="flex w-full items-center gap-2">
        <span className={cn("h-0.5 flex-1 rounded-[1px]", reached ? "bg-brand" : "bg-border", first && "opacity-0")} />
        <span className="relative size-11">
          {status === "current" && (
            <Tracked tracks={tl.stepPulse} className="absolute inset-0">
              <Image src={`${ASSETS}/step-pulse-halo.svg`} width={18} height={18} alt="" className="size-full" />
            </Tracked>
          )}
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              status === "done" && "bg-brand text-primary-foreground shadow-hiw-node",
              status === "current" && "border-2 border-brand bg-background text-brand shadow-hiw-node",
              status === "pending" && "border-[1.5px] border-border bg-background text-muted-foreground",
            )}
          >
            {status === "done" ? <Image src={`${ASSETS}/step-check.svg`} width={8} height={8} alt="" className="size-5" /> : icon}
          </span>
        </span>
        <span
          className={cn(
            "relative h-0.5 flex-1 overflow-hidden rounded-[1px]",
            status === "done" ? "bg-brand" : "bg-border",
            last && "opacity-0",
          )}
        >
          {status === "current" && (
            <Tracked tracks={tl.progressFill} className="absolute inset-y-0 left-0 w-[47px] origin-left bg-brand" />
          )}
        </span>
      </div>
      <p
        className={cn(
          "mt-4 h-10 w-[205px] text-center text-sm leading-5 font-bold",
          reached ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {title}
      </p>
      <p className="mt-1.5 h-[38px] w-[200px] text-center text-[13px] leading-[19px] text-muted-foreground">{text}</p>
      <span
        className={cn(
          "mt-3 flex h-6 items-center rounded-full px-2.5 text-xs",
          status === "current" && "bg-brand-soft font-semibold text-brand-strong",
          status === "done" && "text-muted-foreground",
          status === "pending" && "text-placeholder",
        )}
      >
        {meta}
      </span>
    </>
  );
}

// Diamonds as Figma bounding boxes (real px): [left, top, box]; a 45° square's side is box/√2.
const diamonds: [number, number, number][] = [
  [370, 70, 17],
  [180, 350, 12.7],
  [1338, 20, 14],
  [1508, 310, 17],
  [1074, 90, 11.3],
  [624, 60, 12.7],
];

function DotField({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "absolute bg-[radial-gradient(circle,var(--color-hiw-drag)_1.5px,transparent_1.6px)] bg-size-[22px_22px] opacity-[0.08] mask-[radial-gradient(closest-side,black,transparent)]",
        className,
      )}
    />
  );
}

/** Glow, dot fields, dashed paths, floating SSL / Live chips and blinking diamonds. */
function Backdrop() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-[84px] bottom-0 overflow-hidden">
      <div className="absolute top-[-170px] left-[264px] h-[820px] w-[1200px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-soft)_95%,transparent),color-mix(in_srgb,var(--color-primary-soft)_55%,transparent)_45%,transparent)]" />
      <DotField className="top-[-90px] left-[-110px] size-[520px]" />
      <DotField className="top-[-120px] left-[1318px] size-[520px]" />
      <DotField className="top-[506px] left-[664px] size-[400px]" />
      <Tracked tracks={tl.dashedPath} className="absolute top-[-1px] left-[129px]">
        <Image src={`${ASSETS}/path-left.svg`} width={55} height={82} alt="" className="h-[202px] w-[136px] max-w-none" />
      </Tracked>
      <Tracked tracks={tl.dashedPath} className="absolute top-[139px] left-[1463px]">
        <Image src={`${ASSETS}/path-right.svg`} width={55} height={86} alt="" className="h-[212px] w-[136px] max-w-none" />
      </Tracked>
      <Tracked tracks={tl.chipUp} className="absolute top-[148px] left-[234px]">
        <Image src={`${ASSETS}/chip-ssl.svg`} width={54} height={54} alt="" className="size-[132px] max-w-none" />
      </Tracked>
      <Tracked tracks={tl.chipDown} className="absolute top-[88px] left-[1362px]">
        <Image src={`${ASSETS}/chip-live.svg`} width={54} height={54} alt="" className="size-[132px] max-w-none" />
      </Tracked>
      {diamonds.map(([left, top, box], i) => (
        <Tracked
          key={i}
          tracks={tl.deployDiamonds[i % 3]}
          className="absolute flex items-center justify-center"
          style={{ left, top, width: box, height: box }}
        >
          <span
            className="rotate-45 rounded-[2px] bg-decor-diamond"
            style={{ width: box / Math.SQRT2, height: box / Math.SQRT2 }}
          />
        </Tracked>
      ))}
    </div>
  );
}
