import type { PipelineStage, StepStatus } from "../types";

/** Which stage a step (1–7) belongs to. */
export function stageOfStep(step: number): PipelineStage {
  if (step === 1) return "REQUEST";
  if (step <= 3) return "GENERATION";
  if (step <= 6) return "RELEASE";
  return "LIVE";
}

export const STAGE_LABEL = {
  REQUEST: "Request",
  GENERATION: "Generation",
  RELEASE: "Release",
  LIVE: "Live",
} satisfies Record<PipelineStage, string>;

/** Dot / border colour of a step by status (tokens only). */
export const STEP_TONE = {
  DONE: {
    dot: "bg-success border-success",
    border: "border-border",
    chip: "bg-success-soft text-success",
  },
  RUNNING: {
    dot: "bg-primary border-primary",
    border: "border-2 border-primary shadow-card",
    chip: "bg-primary-soft text-primary",
  },
  FAILED: {
    dot: "bg-danger border-danger",
    border: "border-2 border-danger shadow-card",
    chip: "bg-danger-soft text-danger",
  },
  STUCK: {
    dot: "bg-warning border-warning",
    border: "border-2 border-warning shadow-card",
    chip: "bg-warning-soft text-warning",
  },
  WAITING: {
    dot: "bg-background border-warning",
    border: "border-warning",
    chip: "bg-warning-soft text-warning",
  },
  NOT_STARTED: {
    dot: "bg-background border-border",
    border: "border-dashed border-placeholder/35 bg-muted/70",
    chip: "bg-background text-foreground-soft shadow-button",
  },
} satisfies Record<StepStatus, { dot: string; border: string; chip: string }>;
