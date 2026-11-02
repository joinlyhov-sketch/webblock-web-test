import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, ShieldTick, Tag } from "iconsax-reactjs";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { FitScreen } from "./fit-screen";
import { cn } from "@/lib/utils";

/** Slim top bar of the full-screen billing pages: back button on the left, status chip on the right. */
export function BillingTopBar({
  backHref,
  backLabel,
  chip,
}: {
  backHref: string;
  backLabel: string;
  chip?: { label: string; tone: "brand" | "success" };
}) {
  return (
    <header className="relative z-10 flex h-[72px] shrink-0 items-center gap-4 border-b border-border bg-background px-8">
      <Button asChild variant="ghost" size="sm" className="shadow-button">
        <Link href={backHref}>
          <ArrowLeft variant="Outline" aria-hidden /> {backLabel}
        </Link>
      </Button>
      {chip && (
        <span
          className={cn(
            "ml-auto inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[14px] leading-[20px] font-semibold whitespace-nowrap",
            chip.tone === "brand" ? "bg-brand-soft text-brand-strong" : "bg-success-soft text-success",
          )}
        >
          <span
            aria-hidden
            className={cn("size-1.5 rounded-[3px]", chip.tone === "brand" ? "bg-brand-strong" : "bg-success")}
          />
          {chip.label}
        </span>
      )}
    </header>
  );
}

type Cube = { x: number; y: number; size: number; outline?: boolean };

// Positions are on the 1728px-wide Figma canvas, measured from the top of the content area.
const CUBES = {
  payment: [
    { x: 234, y: 94, size: 31.5 },
    { x: 324, y: 640, size: 20 },
    { x: 184, y: 447, size: 19, outline: true },
    { x: 1434, y: 154, size: 26 },
    { x: 1384, y: 407, size: 18, outline: true },
    { x: 1494, y: 670, size: 35 },
    { x: 1194, y: 64, size: 16 },
    { x: 484, y: 74, size: 15 },
  ],
  deploy: [
    { x: 122, y: 334, size: 28 },
    { x: 660, y: 112, size: 14 },
    { x: 1380, y: 140, size: 24 },
    { x: 1326, y: 273, size: 14 },
    { x: 1561, y: 634, size: 32 },
    { x: 166, y: 680, size: 18 },
    { x: 402, y: 211, size: 16, outline: true },
    { x: 1591, y: 434, size: 16, outline: true },
  ],
} satisfies Record<string, Cube[]>;

/** Rotation start/end (deg), rise/fall (px) and phase of the eight Figma "Floating cube" loops. */
const FLOAT = [
  { r0: -14, r1: -6, dy: -6, delay: 0 },
  { r0: 18, r1: 10, dy: 9, delay: 0.3 },
  { r0: -30, r1: -22, dy: -12, delay: 0.6 },
  { r0: 12, r1: 4, dy: 6, delay: 0.9 },
  { r0: -22, r1: -14, dy: -9, delay: 0 },
  { r0: -10, r1: -18, dy: 12, delay: 0.3 },
  { r0: 25, r1: 33, dy: -6, delay: 0.6 },
  { r0: -20, r1: -28, dy: 9, delay: 0.9 },
];

function floatStyle(index: number, base = 0): CSSProperties {
  const f = FLOAT[index % FLOAT.length];
  return {
    "--r0": `${base + f.r0}deg`,
    "--r1": `${base + f.r1}deg`,
    "--dy": `${f.dy}px`,
    "--delay": `${f.delay}s`,
  } as CSSProperties;
}

const DOT_FIELDS = {
  payment: [
    { x: 84, y: 24 },
    { x: 1184, y: 330 },
  ],
  deploy: [
    { x: -200, y: 160 },
    { x: 1468, y: 308 },
  ],
} satisfies Record<string, { x: number; y: number }[]>;

function at(x: number, y: number, size?: number): CSSProperties {
  return { left: `${x}px`, top: `${y}px`, width: size, height: size };
}

const DIAMONDS = [
  { x: 360, y: 52.9, s: 10 },
  { x: 1360, y: 31.5, s: 12 },
  { x: 100, y: 190.1, s: 14 },
  { x: 1640, y: 418.7, s: 16 },
  { x: 1600, y: 722.9, s: 10 },
  { x: 180, y: 761.5, s: 12 },
];

/** Dot grid, tag and shield bubbles, dashed paths and floating diamonds (Figma "Change Plan"). */
function ChangeBackdrop() {
  return (
    <div className="absolute inset-y-0 left-1/2 w-[1728px] -translate-x-1/2">
      <div className="absolute top-[50px] left-0 h-[908px] w-[1728px] bg-[url('/images/billing/dot-grid.svg')] bg-no-repeat" />
      <div className="absolute top-[70px] left-[1540px] flex size-20 items-center justify-center rounded-[40px] bg-linear-[135deg] from-bubble-from to-bubble-to to-71% text-primary-foreground shadow-bubble">
        <Tag variant="Outline" className="size-8" />
      </div>
      <div className="absolute top-[106px] left-[1616px] h-[88px] w-[133px] bg-[url('/images/billing/dashed-path-right.svg')] bg-no-repeat" />
      <div className="absolute top-[510px] left-28 flex size-[84px] items-center justify-center rounded-[42px] bg-background drop-shadow-[0_10px_15px_rgb(60_120_207/0.1)]">
        <span className="flex size-[60px] items-center justify-center rounded-[30px] bg-brand-soft text-brand">
          <ShieldTick variant="Outline" className="size-7" />
        </span>
        <span className="absolute top-[59px] left-[59px] size-[22px] bg-[url('/images/billing/online-dot.svg')] bg-no-repeat" />
      </div>
      <div className="absolute top-[346px] -left-3.5 h-[210px] w-[130px] bg-[url('/images/billing/dashed-path-left.svg')] bg-no-repeat" />
      {DIAMONDS.map((d, index) => (
        <span
          key={`${d.x}-${d.y}`}
          className="absolute flex items-center justify-center"
          style={{ left: d.x, top: d.y, width: d.s * 1.4142, height: d.s * 1.4142 }}
        >
          <span
            className="animate-billing-float rounded-[3px] bg-cube"
            style={{ width: d.s, height: d.s, ...floatStyle(index, 45 - FLOAT[index % FLOAT.length].r0) }}
          />
        </span>
      ))}
    </div>
  );
}

/** Soft glow, dot fields and floating cubes behind the billing screens. */
export function BillingBackdrop({ variant }: { variant: "payment" | "deploy" | "change" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[72px] bottom-0 overflow-hidden">
      {variant === "change" ? (
        <ChangeBackdrop />
      ) : (
        <div className="absolute inset-y-0 left-1/2 w-[1728px] -translate-x-1/2">
          <div
            className="absolute h-[760px] w-[1300px] rounded-full bg-radial from-card-tint to-transparent to-70%"
            style={at(214, variant === "payment" ? 17 : 123)}
          />
          {DOT_FIELDS[variant].map((field) => (
            <div
              key={field.x}
              className="absolute size-[460px] bg-[radial-gradient(circle,var(--color-dot)_1.5px,transparent_1.6px)] bg-size-[22px_22px] mask-[radial-gradient(circle,black_30%,transparent_68%)]"
              style={at(field.x, field.y)}
            />
          ))}
          {CUBES[variant].map((cube: Cube, index) => (
            <span
              key={`${cube.x}-${cube.y}`}
              className={cn(
                "animate-billing-float absolute",
                cube.outline ? "rounded-[5px] border-[1.5px] border-primary" : "rounded-[6px] bg-cube",
              )}
              style={{ ...at(cube.x, cube.y, cube.size), ...floatStyle(index) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Exactly one screen high: the page never scrolls, the content is fitted by `BillingContent`. */
export function BillingScreen({ children }: { children: ReactNode }) {
  return <div className="relative flex h-dvh flex-col overflow-hidden bg-background">{children}</div>;
}

/** Content shared by the plans and payment pages: centred under the top bar and scaled to fit the screen. */
export function BillingContent({ children }: { children: ReactNode }) {
  return <FitScreen>{children}</FitScreen>;
}

/** Eyebrow pill, title and subtitle at a fixed height and spacing on every billing page. */
export function BillingTitle({
  eyebrow,
  icon,
  title,
  subtitle,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <PageHeader
      align="center"
      size="hero"
      className="mb-0 h-[160px] w-full"
      eyebrow={
        <Pill outline icon={icon}>
          {eyebrow}
        </Pill>
      }
      title={title}
      description={subtitle}
    />
  );
}
