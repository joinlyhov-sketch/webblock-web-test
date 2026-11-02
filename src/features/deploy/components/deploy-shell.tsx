import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Element3 } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Floating cubes: position in %, size in px, rotation (deg), rise/fall (px) and phase (s).
// They reuse the billing screens' `animate-billing-float` loop (off for reduced motion).
const CUBES = [
  { x: "8%", y: "30%", size: 28, r: -14, dy: -8, delay: 0 },
  { x: "20%", y: "14%", size: 14, r: 18, dy: 9, delay: 0.6, outline: true },
  { x: "36%", y: "78%", size: 16, r: -22, dy: -10, delay: 1.2 },
  { x: "78%", y: "18%", size: 24, r: 12, dy: 8, delay: 0.3 },
  { x: "90%", y: "46%", size: 16, r: 25, dy: -9, delay: 0.9, outline: true },
  { x: "86%", y: "76%", size: 32, r: -10, dy: 10, delay: 1.5 },
  { x: "10%", y: "74%", size: 18, r: 20, dy: -7, delay: 0.4 },
  { x: "62%", y: "86%", size: 14, r: -18, dy: 7, delay: 1.1 },
];

/**
 * Full-screen frame of the Deploy screens (Figma "13 First Deploy", "15 Deploying"): the website chip
 * top-right, "Back to editor" top-left (every state, so the page is never a dead end) and a soft dotted
 * backdrop. The page never needs a sidebar.
 */
export function DeployShell({
  siteName,
  backHref,
  children,
}: {
  siteName: string;
  /** The editor of this website. A running deploy keeps going after the owner leaves. */
  backHref: string;
  children: ReactNode;
}) {
  return (
    <div className="relative -m-page flex min-h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-radial from-card-tint to-transparent to-70%" />
        <div className="absolute top-12 -left-24 size-[420px] bg-[radial-gradient(circle,var(--color-dot)_1.5px,transparent_1.6px)] bg-size-[22px_22px] mask-[radial-gradient(circle,black_30%,transparent_68%)]" />
        <div className="absolute top-40 -right-24 size-[420px] bg-[radial-gradient(circle,var(--color-dot)_1.5px,transparent_1.6px)] bg-size-[22px_22px] mask-[radial-gradient(circle,black_30%,transparent_68%)]" />
        {CUBES.map((cube) => (
          <span
            key={`${cube.x}-${cube.y}`}
            className={cn(
              "animate-billing-float absolute",
              cube.outline ? "rounded-[5px] border-[1.5px] border-primary" : "rounded-[6px] bg-cube",
            )}
            style={
              {
                left: cube.x,
                top: cube.y,
                width: cube.size,
                height: cube.size,
                "--r0": `${cube.r}deg`,
                "--r1": `${cube.r + 8}deg`,
                "--dy": `${cube.dy}px`,
                "--delay": `${cube.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <header className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-5 pt-5">
        <Button asChild variant="secondary" size="sm" className="bg-background shadow-card">
          <Link href={backHref}>
            <ArrowLeft aria-hidden /> Back to editor
          </Link>
        </Button>
        <div className="flex items-center gap-2.5 rounded-2xl bg-background py-2 pr-4 pl-2 shadow-card">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground [&_svg]:size-4">
            <Element3 aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="max-w-[200px] truncate text-[14px] leading-[18px] font-semibold text-foreground">
              {siteName}
            </span>
            <span className="text-[13px] leading-[18px] text-muted-foreground">
              Home page
            </span>
          </span>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-[72px] pb-28">
        {children}
      </div>
    </div>
  );
}
