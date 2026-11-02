import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

/** Title block of an auth screen: optional step bars, back link, icon tile and "STEP n OF 3". */
export function AuthHeader({
  title,
  description,
  step,
  backHref,
  icon,
}: {
  title: string;
  description: ReactNode;
  step?: number;
  backHref?: string;
  icon?: ReactNode;
}) {
  return (
    <>
      {step && <StepBars current={step} />}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 self-start rounded-md text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft variant="Outline" className="size-4" />
          Back
        </Link>
      )}
      {icon && (
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary [&_svg]:size-[26px]">
          {icon}
        </span>
      )}
      <header>
        {step && (
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Step {step} of {TOTAL_STEPS}
          </p>
        )}
        <h1 className="pt-2 text-[36px] leading-[1.15] font-semibold tracking-[-0.72px] text-foreground first:pt-0">
          {title}
        </h1>
        <p className="pt-1.5 text-base text-muted-foreground">{description}</p>
      </header>
    </>
  );
}

const TOTAL_STEPS = 3;

function StepBars({ current }: { current: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={current}
      className="flex gap-2"
    >
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span
          key={i}
          className={cn("h-1 flex-1 rounded-full", i < current ? "bg-primary" : "bg-primary/20")}
        />
      ))}
    </div>
  );
}
