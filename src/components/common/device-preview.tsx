"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Devices, Lock1, Mobile, Monitor } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const devices: { id: PreviewDevice; label: string; icon: ReactNode }[] = [
  { id: "desktop", label: "Desktop", icon: <Monitor variant="Outline" /> },
  { id: "tablet", label: "Tablet", icon: <Devices variant="Outline" /> },
  { id: "mobile", label: "Mobile", icon: <Mobile variant="Outline" /> },
];

/** Decorative dots on the desktop canvas (Figma "Preview decor"). */
const softDots = [
  { file: "ea3a0", size: 14, left: 120, top: 260 },
  { file: "b09ea", size: 10, left: 205, top: 520 },
  { file: "fe292", size: 16, left: 90, top: 760 },
  { file: "99712", size: 12, left: 1560, top: 140 },
  { file: "8b01d", size: 16, left: 1640, top: 420 },
  { file: "e69bd", size: 10, left: 1540, top: 640 },
  { file: "7a23f", size: 12, left: 1660, top: 860 },
  { file: "1568c", size: 10, left: 180, top: 920 },
];

/** Natural (Figma) size of each device, used to fit it into the viewport. */
const natural: Record<PreviewDevice, { w: number; h: number }> = {
  desktop: { w: 1317.6, h: 880 },
  tablet: { w: 662.316, h: 889.26 },
  mobile: { w: 426.866, h: 888.76 },
};

/**
 * Figma "Preview decor" motion, a 2s loop: each element fades in and floats up after a stagger
 * (0.05 + 0.04 per item, of 2s), then drifts up 6 or 10px. "Template dot" pulses to 1.3x.
 * Also the enter animation used whenever the device size changes.
 */
const FLOAT_COUNT = 10;
function buildMotionCss() {
  const pct = (n: number) => +(n * 100).toFixed(2);
  const frames = Array.from({ length: FLOAT_COUNT }, (_, i) => {
    const d = 0.05 + 0.04 * i;
    const amp = i === 9 ? 6 : i % 2 ? 10 : 6;
    return `@keyframes pv-float-${i}{0%{opacity:0;transform:translateY(12px);animation-timing-function:linear}${pct(d)}%{opacity:0;transform:translateY(12px);animation-timing-function:ease-out}${pct(d + 0.3)}%{opacity:1;transform:translateY(0.3px)}${pct(d + 0.35)}%{opacity:1;transform:translateY(0);animation-timing-function:ease-in-out}99.99%{opacity:1;transform:translateY(-${amp}px);animation-timing-function:ease-in-out}100%{opacity:1;transform:translateY(0)}}`;
  }).join("");
  return `${frames}
@keyframes pv-pulse{0%,50%{transform:scale(1);animation-timing-function:ease-out}80%{transform:scale(1.3);animation-timing-function:ease-in-out}100%{transform:scale(1)}}
@keyframes pv-enter{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
.pv-float{animation:var(--pv-name) 2s infinite both}
.pv-pulse{animation:pv-pulse 2s infinite}
.pv-enter{animation:pv-enter .5s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.pv-float,.pv-pulse,.pv-enter{animation:none!important;opacity:1!important}}`;
}
const motionCss = buildMotionCss();

/** Scales a device down so it always fits the stage (never up, never overflowing the viewport). */
function DeviceStage({
  device,
  padBottom,
  children,
}: {
  device: PreviewDevice;
  padBottom: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const { w, h } = natural[device];
  const padX = 24;
  const padTop = 20;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const aw = el.clientWidth - padX * 2;
      const ah = el.clientHeight - padTop - padBottom;
      setScale(Math.max(0.2, Math.min(1, aw / w, ah / h)));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, padBottom]);

  const s = scale ?? 1;
  return (
    <div
      ref={ref}
      className="relative flex min-h-0 flex-1 items-center justify-center"
      style={{ paddingTop: padTop, paddingBottom: padBottom }}
    >
      <div
        key={device}
        className="pv-enter relative shrink-0 transition-[width,height] duration-500 ease-out"
        style={{
          width: w * s,
          height: h * s,
          visibility: scale === null ? "hidden" : "visible",
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: w, transform: `scale(${s})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const chip =
  "items-center gap-2 rounded-full bg-background py-2 pr-3.5 pl-3 text-[13px] font-semibold text-foreground shadow-[0_12px_28px_rgb(27_43_75/0.08),0_2px_6px_rgb(27_43_75/0.05)]";

function MonitorFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-[1317.6px] flex-col items-center">
      <div className="flex w-full flex-col overflow-clip rounded-[23.187px] bg-device-monitor px-[13.377px] pt-[13.377px] shadow-[0_23.187px_46.374px_rgb(60_120_207/0.18)]">
        <div className="h-[768.077px] w-full overflow-clip rounded-[5.797px] bg-background">
          {children}
        </div>
        <div className="flex h-[43.476px] w-full shrink-0 items-center justify-center bg-device-chin">
          <Image
            src="/images/preview/monitor-logo.svg"
            alt=""
            width={9}
            height={9}
            unoptimized
          />
        </div>
      </div>
      <div className="h-[43.476px] w-[130.428px] bg-linear-to-r from-device-stand via-device-chin to-device-stand" />
      <div className="h-[11.594px] w-[289.84px] rounded-[5.797px] bg-device-stand" />
    </div>
  );
}

function TabletFrame({ children }: { children: ReactNode }) {
  const key =
    "absolute -right-[14px] h-[57.895px] w-[5.789px] rounded-[2.316px] bg-linear-to-r from-device-key-tablet via-device-key-tablet-mid to-device-key-tablet";
  return (
    <div className="relative flex w-[662.316px] flex-col rounded-[48.632px] border-[4.632px] border-device-tablet-edge bg-device-phone p-[18.526px] shadow-[0_6.947px_8.105px_rgb(60_120_207/0.07),0_34.737px_34.737px_rgb(60_120_207/0.18)]">
      <div className="relative h-[842.947px] w-full overflow-clip rounded-[25.474px] bg-background">
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10px] left-1/2 h-[5.789px] w-[173.684px] -translate-x-1/2 rounded-[3.474px] bg-device-phone/85"
      />
      <Image
        src="/images/preview/tablet-camera.svg"
        alt=""
        width={8}
        height={8}
        unoptimized
        className="absolute top-[5.21px] left-1/2 -translate-x-1/2"
      />
      <span
        aria-hidden
        className="absolute -top-[9.26px] right-[41px] h-[5.789px] w-[69.474px] rounded-[2.316px] bg-linear-to-b from-device-key-tablet via-device-key-tablet-mid to-device-key-tablet"
      />
      <span aria-hidden className={cn(key, "top-[111.16px]")} />
      <span aria-hidden className={cn(key, "top-[180.63px]")} />
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  const key =
    "absolute w-[5.473px] rounded-[2.189px] bg-linear-to-r from-device-key via-device-key-mid to-device-key";
  return (
    <div className="relative flex w-[426.866px] flex-col rounded-[62.607px] border-[4.378px] border-device-phone-edge bg-device-phone p-[13.134px] shadow-[0_6.567px_7.662px_rgb(60_120_207/0.08),0_32.836px_32.836px_rgb(60_120_207/0.2)]">
      <div className="relative h-[853.731px] w-full overflow-clip rounded-[49.801px] bg-background">
        <div className="relative z-10 h-[56.92px] w-full bg-background">
          <span className="absolute top-[18.28px] left-[45.97px] font-[Inter,sans-serif] text-[16.418px] font-semibold text-device-phone">
            9:41
          </span>
          <Image
            src="/images/preview/status-icons.svg"
            alt=""
            width={79}
            height={14}
            unoptimized
            className="absolute top-[21.02px] left-[291.14px]"
          />
        </div>
        <div className="h-[calc(100%-56.92px)] w-full">{children}</div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[8px] left-1/2 h-[5.473px] w-[146.667px] -translate-x-1/2 rounded-[3.284px] bg-device-phone/85"
      />
      <Image
        src="/images/preview/dynamic-island.svg"
        alt=""
        width={120}
        height={31}
        unoptimized
        className="absolute top-[25.61px] left-1/2 z-20 -translate-x-1/2"
      />
      <span
        aria-hidden
        className={cn(key, "-left-[8.76px] top-[164.18px] h-[32.836px]")}
      />
      <span
        aria-hidden
        className={cn(key, "-left-[8.76px] top-[223.29px] h-[63.483px]")}
      />
      <span
        aria-hidden
        className={cn(key, "-left-[8.76px] top-[299.9px] h-[63.483px]")}
      />
      <span
        aria-hidden
        className={cn(key, "-right-[14px] top-[258.31px] h-[100.697px]")}
      />
    </div>
  );
}

/** Pill Desktop / Tablet / Mobile switch (Figma "Preview size"). */
export function DeviceTabs({
  value,
  onChange,
  className,
}: {
  value: PreviewDevice;
  onChange: (device: PreviewDevice) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Preview size"
      className={cn(
        "flex w-[397px] shrink-0 items-start gap-1 rounded-full bg-switcher p-1",
        className,
      )}
    >
      {devices.map((d) => {
        const on = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(d.id)}
            className={cn(
              "flex h-9 min-w-px flex-1 items-center justify-center gap-1.5 rounded-full px-[18px] text-sm leading-[21px] outline-none transition-[background-color,color,box-shadow] duration-300 ease-out focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-[14px]",
              on
                ? "bg-background font-semibold text-brand-deep shadow-[0_4px_5px_rgb(60_120_207/0.08),0_1px_1.5px_rgb(60_120_207/0.08)]"
                : "font-medium text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {d.icon}
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Full-screen preview (Figma "08b Template Preview" / "12 Preview"): top bar with back link, title,
 * device switch and an action; the page inside a monitor, tablet or phone that scales to fit.
 * `children(device)` renders what goes on the screen; it should fill it and scroll by itself.
 * Full-bleed: `-m-page` cancels the (studio) layout padding.
 */
export function DevicePreview({
  backHref,
  backLabel,
  title,
  action,
  badge,
  address,
  children,
}: {
  backHref: string;
  backLabel: string;
  /** Name (and badge) after the back link. */
  title: ReactNode;
  action: ReactNode;
  /** Floating chip top-left on desktop, e.g. "Template preview". */
  badge: string;
  /** Address chip under the monitor, e.g. "yourbusiness.webblock.com". */
  address: string;
  children: (device: PreviewDevice) => ReactNode;
}) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const screen = children(device);

  return (
    <div className="-m-page flex h-dvh max-h-dvh flex-col overflow-hidden bg-linear-to-b from-page-from via-page-via via-60% to-page">
      <style>{motionCss}</style>
      <header className="flex h-[72px] shrink-0 items-center gap-6 border-b border-border bg-background px-8">
        <div className="flex min-w-px flex-1 items-center gap-4 overflow-clip">
          <Link
            href={backHref}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[13px] leading-[19.5px] font-semibold whitespace-nowrap text-foreground-soft shadow-button outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ArrowLeft variant="Outline" aria-hidden className="size-[15px]" /> {backLabel}
          </Link>
          <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
          <div className="flex min-w-0 items-center gap-2.5 whitespace-nowrap">
            {title}
          </div>
        </div>

        <DeviceTabs value={device} onChange={setDevice} />

        <div className="flex min-w-px flex-1 items-center justify-end overflow-clip">
          {action}
        </div>
      </header>

      {
        <div className="relative flex min-h-0 flex-1 flex-col bg-page">
          <div
            aria-hidden
            className="bg-dots pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden xl:block"
          >
            {softDots.map((d, i) => (
              <div
                key={d.file}
                className="pv-float absolute"
                style={{
                  left: `${(d.left / 1728) * 100}%`,
                  top: `${(d.top / 1045) * 100}%`,
                  width: d.size,
                  height: d.size,
                  ["--pv-name" as string]: `pv-float-${i}`,
                }}
              >
                <Image
                  src={`/images/preview/dot-${d.file}.svg`}
                  alt=""
                  width={d.size}
                  height={d.size}
                  unoptimized
                />
              </div>
            ))}
          </div>
          <div
            aria-hidden
            className="pv-float absolute top-[11.5%] left-7 hidden xl:block"
            style={{ ["--pv-name" as string]: "pv-float-8" }}
          >
            <p className={cn(chip, "inline-flex")}>
              <span className="pv-pulse size-2.5 rounded-full bg-primary shadow-[0_0_0_3px_rgb(67_121_214/0.35)]" />
              {badge}
            </p>
          </div>
          <DeviceStage device={device} padBottom={64}>
            {device === "desktop" ? (
              <MonitorFrame>{screen}</MonitorFrame>
            ) : device === "tablet" ? (
              <TabletFrame>{screen}</TabletFrame>
            ) : (
              <PhoneFrame>{screen}</PhoneFrame>
            )}
          </DeviceStage>
          <div
            className="pv-float pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
            style={{ ["--pv-name" as string]: "pv-float-9" }}
          >
            <p className={cn(chip, "inline-flex")}>
              <Lock1 variant="Outline" aria-hidden className="size-[14px]" />
              {address}
            </p>
          </div>
        </div>
      }
    </div>
  );
}
