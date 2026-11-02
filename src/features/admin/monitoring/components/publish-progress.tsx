import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { PipelineRun } from "../types";
import { STAGE_LABEL, STEP_TONE, stageOfStep } from "./stage";

/** Table cell "Deploy flow": 7 dots joined by lines, then "3 / 7 · Generation". */
export function PublishProgress({
  run,
}: {
  run: Pick<PipelineRun, "steps" | "currentStep">;
}) {
  return (
    <div className="space-y-1">
      <div
        role="img"
        aria-label={`Step ${run.currentStep} of ${run.steps.length}: ${run.steps[run.currentStep - 1]?.title}`}
        className="flex items-center"
      >
        {run.steps.map((step, i) => (
          <Fragment key={step.number}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "h-0 w-2.5 border-t-2",
                  step.status === "NOT_STARTED"
                    ? "border-dotted border-border"
                    : "border-success",
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "size-[7px] shrink-0 rounded-full border-[1.5px]",
                STEP_TONE[step.status].dot,
                step.status === "RUNNING" && "motion-safe:animate-pulse",
              )}
            />
          </Fragment>
        ))}
      </div>
      <p className="text-[13px] text-muted-foreground">
        {run.currentStep} / {run.steps.length} ·{" "}
        {STAGE_LABEL[stageOfStep(run.currentStep)]}
      </p>
    </div>
  );
}
