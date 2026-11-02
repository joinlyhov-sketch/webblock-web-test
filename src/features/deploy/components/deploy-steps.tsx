import type { ReactNode } from "react";
import { Box, Check, Data, Global, Layer, ShieldTick } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import type {
  DeployStepKey,
  DeployStepStatus,
  Deployment,
  DeploymentStep,
} from "../types";

const STEP_ICON: Record<DeployStepKey, ReactNode> = {
  BUILD: <Layer variant="Outline" aria-hidden />,
  PRODUCTS: <Box variant="Outline" aria-hidden />,
  PACKAGE: <Box variant="Outline" aria-hidden />,
  LAUNCH: <Data variant="Outline" aria-hidden />,
  SSL: <ShieldTick variant="Outline" aria-hidden />,
  LIVE: <Global variant="Outline" aria-hidden />,
};

const STEP_COPY: Record<
  DeployStepKey,
  { title: (domain: string) => string; detail: (domain: string) => string }
> = {
  BUILD: {
    title: () => "Building your website",
    detail: () => "Turning your design into a fast website",
  },
  PRODUCTS: {
    title: () => "Setting up your products",
    detail: () => "Creating storage for products, prices and custom fields",
  },
  PACKAGE: {
    title: () => "Packaging everything",
    detail: () => "Preparing your site to run on our servers",
  },
  LAUNCH: {
    title: () => "Launching your website",
    detail: () => "Starting your website and its data service",
  },
  SSL: {
    title: () => "Securing your site",
    detail: (domain) => `Adding the SSL padlock to ${domain}`,
  },
  LIVE: { title: () => "Live!", detail: () => "Your website is open to customers" },
};

const STATUS_LABEL: Record<
  Exclude<DeployStepStatus, "DONE" | "IN_PROGRESS" | "FAILED">,
  string
> = {
  UP_NEXT: "Up next",
  WAITING: "Waiting",
  NOT_STARTED: "Not started",
};

function StepStatus({ step }: { step: DeploymentStep }) {
  if (step.status === "DONE")
    return (
      <span className="text-[13px] text-muted-foreground">
        Done · {step.seconds ?? 0}s
      </span>
    );
  if (step.status === "IN_PROGRESS" || step.status === "FAILED") {
    return (
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[13px] font-medium",
          step.status === "FAILED"
            ? "bg-danger-soft text-danger"
            : "bg-brand-soft text-brand-strong",
        )}
      >
        {step.status === "FAILED" ? "Failed" : "In progress"}
      </span>
    );
  }
  return (
    <span className="text-[13px] text-muted-foreground">
      {STATUS_LABEL[step.status]}
    </span>
  );
}

function StepBadge({ step }: { step: DeploymentStep }) {
  const done = step.status === "DONE";
  const active = step.status === "IN_PROGRESS";
  const failed = step.status === "FAILED";
  return (
    <span
      className={cn(
        "relative z-10 flex size-[34px] items-center justify-center rounded-full border bg-background [&_svg]:size-4",
        "motion-safe:transition-colors motion-safe:duration-300",
        done && "border-primary bg-primary text-primary-foreground",
        active && "border-primary text-primary",
        failed && "border-danger text-danger",
        !done && !active && !failed && "border-border text-muted-foreground",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden rounded-full border border-primary motion-safe:block motion-safe:animate-halo-ripple"
        />
      )}
      {done ? (
        <Check variant="Outline" aria-hidden className="motion-safe:animate-check-pop" />
      ) : (
        STEP_ICON[step.key]
      )}
    </span>
  );
}

/** "Deploy steps" card: the six stages of a deploy and where the backend is now. Display only. */
export function DeploySteps({ deployment }: { deployment: Deployment }) {
  const { steps } = deployment;
  const failedAt = steps.findIndex((s) => s.status === "FAILED");
  const done = steps.filter((s) => s.status === "DONE").length;
  const failed = failedAt !== -1;

  return (
    <section
      aria-label="Deploy steps"
      className="w-full max-w-[960px] overflow-hidden rounded-2xl border border-border bg-background shadow-card"
    >
      <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Deploy steps
          </h2>
          <span aria-hidden className="flex gap-1">
            {steps.map((s) => (
              <span
                key={s.key}
                className={cn(
                  "h-[3px] w-4 rounded-full motion-safe:transition-colors motion-safe:duration-500",
                  s.status === "DONE" && (failed ? "bg-danger" : "bg-primary"),
                  s.status === "IN_PROGRESS" && "bg-primary/40",
                  s.status === "FAILED" && "bg-danger/40",
                  !["DONE", "IN_PROGRESS", "FAILED"].includes(s.status) &&
                    "bg-border",
                )}
              />
            ))}
          </span>
        </div>
        <p className="text-[13px] font-medium text-muted-foreground">
          {failed
            ? `Failed at step ${failedAt + 1}`
            : `${done} of ${steps.length} done`}
        </p>
      </header>
      <ol className="grid grid-cols-2 gap-x-2 gap-y-8 px-4 py-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {steps.map((step, index) => {
          const copy = STEP_COPY[step.key];
          const linked =
            index > 0 &&
            steps[index - 1].status === "DONE" &&
            step.status !== "NOT_STARTED";
          return (
            <li
              key={step.key}
              className="relative flex min-w-0 flex-col items-center gap-1.5 px-2 text-center"
            >
              {index > 0 && (
                // Grey track with a blue fill that grows left → right when the previous step finishes.
                <span
                  aria-hidden
                  className="absolute top-[17px] right-1/2 hidden h-px w-full overflow-hidden bg-border lg:block"
                >
                  <span
                    className={cn(
                      "block h-full w-full origin-left bg-primary motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out",
                      linked ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              )}
              <StepBadge step={step} />
              <p className="max-w-full text-sm leading-5 font-semibold text-foreground">
                {copy.title(deployment.domain)}
              </p>
              <p className="text-xs leading-[18px] text-muted-foreground [overflow-wrap:anywhere]">
                {copy.detail(deployment.domain)}
              </p>
              <div className="mt-auto pt-2">
                <StepStatus step={step} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
