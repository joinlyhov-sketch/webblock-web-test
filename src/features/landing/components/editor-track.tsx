"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useLoopPlaying } from "@/components/common/motion";

/** Length of the Figma prototype loop every editor-demo track shares. */
export const EDITOR_LOOP_SECONDS = 14;

/** Point of the loop shown as the still frame (reduced motion, off-screen, before hydration). */
const REST_AT = 0.75;

type Bezier = [number, number, number, number];
type Ease = "linear" | "easeIn" | "easeOut" | "easeInOut" | Bezier;
type Value = number | string;

/** One animated property: keyframe values at normalised `times` (0–1 of the loop). */
export type Keyframes = { values: Value[]; times: number[]; ease: Ease | Ease[] };
export type TrackSpec = Record<string, Keyframes>;

/** Linear sample of a track at `t`. Only used for the still frame, which sits on plateaus. */
function sample({ values, times }: Keyframes, t: number): Value {
  const i = times.findIndex((time) => time >= t);
  if (i <= 0) return values[Math.max(i, 0)];
  const [a, b] = [values[i - 1], values[i]];
  if (typeof a !== "number" || typeof b !== "number") return t - times[i - 1] < times[i] - t ? a : b;
  const p = (t - times[i - 1]) / (times[i] - times[i - 1]);
  return a + (b - a) * p;
}

function restFrame(spec: TrackSpec) {
  return Object.fromEntries(Object.entries(spec).map(([key, kf]) => [key, sample(kf, REST_AT)]));
}

function loopTransition(spec: TrackSpec) {
  return Object.fromEntries(
    Object.entries(spec).map(([key, { times, ease }]) => [
      key,
      { duration: EDITOR_LOOP_SECONDS, times, ease, repeat: Infinity },
    ]),
  );
}

/**
 * A layer driven by Figma keyframes. Plays the loop while the surrounding `LoopStage` is on screen
 * (every track restarts together, so they stay in sync); otherwise rests on the `REST_AT` frame.
 */
export function Track({
  spec,
  className,
  style,
  children,
}: {
  spec: TrackSpec;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const playing = useLoopPlaying();
  const rest = restFrame(spec);
  const keyframes = Object.fromEntries(Object.entries(spec).map(([key, kf]) => [key, kf.values]));

  return (
    <motion.div
      className={className}
      style={style}
      initial={rest}
      animate={playing ? keyframes : rest}
      transition={playing ? loopTransition(spec) : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
