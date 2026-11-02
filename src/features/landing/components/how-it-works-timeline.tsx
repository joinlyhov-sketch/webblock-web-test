"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useLoopPlaying, useReducedMotion } from "@/components/common/motion";

// Keyframe tracks for the "How it works" demo, copied from Figma's 14s prototype timeline
// (get_motion_context on 5574:226037). Every track shares one clock, so they stay in sync.
// Step 2 now shows the current editor (site settings, WebBlock AI folded on top), which has no
// prototype yet: its tracks are timed by hand to fit the same window (editor in at 0.2786, Deploy
// clicked at 0.5857).

const LOOP_SECONDS = 14;
/** Frame held for viewers who prefer reduced motion: the site is live and step 3 is active. */
const REDUCED_MOTION_FRAME = 0.9;

type Cubic = readonly [number, number, number, number];
type Ease = "linear" | "easeIn" | "easeOut" | "easeInOut" | Cubic;
type Value = number | string;
export type Track = { values: Value[]; times: number[]; ease?: Ease | Ease[] };
export type Tracks = Record<string, Track>;

const IN_OUT: Cubic = [0.5, 0, 0.5, 1];
const POP: Cubic = [0.45, 1.45, 0.8, 1];

const track = (values: Value[], times: number[], ease?: Ease | Ease[]): Track => ({
  values,
  times,
  ease,
});

/** Value of a track at normalised time `t` (linear between keyframes; exact on the holds). */
function sample({ values, times }: Track, t: number): Value {
  const next = times.findIndex((time) => time >= t);
  if (next <= 0) return values[Math.max(next, 0)];
  const from = values[next - 1];
  const to = values[next];
  if (typeof from !== "number" || typeof to !== "number") return t >= times[next] ? to : from;
  const progress = (t - times[next - 1]) / (times[next] - times[next - 1]);
  return from + (to - from) * progress;
}

/**
 * A `motion.div` driven by Figma keyframe tracks. It loops while its `LoopStage` is on screen and
 * otherwise rests on the first frame (or the "live" frame when motion is reduced).
 */
export function Tracked({
  tracks,
  ...props
}: { tracks: Tracks } & Omit<ComponentProps<typeof motion.div>, "animate" | "initial" | "transition">) {
  const playing = useLoopPlaying();
  const reduceMotion = useReducedMotion();
  const entries = Object.entries(tracks);
  const restAt = reduceMotion ? REDUCED_MOTION_FRAME : 0;

  const animate = Object.fromEntries(
    entries.map(([key, t]) => [key, playing ? t.values : sample(t, restAt)]),
  );
  const transition = playing
    ? Object.fromEntries(
        entries.map(([key, t]) => [
          key,
          { duration: LOOP_SECONDS, times: t.times, ease: t.ease ?? "linear", repeat: Infinity },
        ]),
      )
    : { duration: 0 };

  return <motion.div initial={false} animate={animate} transition={transition} {...props} />;
}

/**
 * Renders real-size UI (e.g. the 1728px editor) shrunk to its Figma panel size. The mock screens
 * are authored at real size so their values stay round; `scale` is Figma's instance scale.
 */
export function RealSize({
  width,
  height,
  scale,
  children,
}: {
  width: number;
  height: number;
  scale: number;
  children: ReactNode;
}) {
  return (
    <div className="origin-top-left" style={{ width, height, transform: `scale(${scale})` }}>
      {children}
    </div>
  );
}

const fadeInOut =(times: number[], ease: Ease[]) => track([0, 0, 1, 1, 0, 0], times, ease);
const SCREEN_EASE: Ease[] = ["linear", "easeInOut", IN_OUT, "easeInOut", "linear"];
const DIALOG_EASE: Ease[] = ["linear", "easeOut", IN_OUT, "linear", "linear"];
const ENTER_EASE: Ease[] = ["linear", "easeOut", "linear"];
const DIAMOND_EASE: Ease[] = ["linear", "easeInOut", "easeInOut", "easeInOut", "linear"];

const ripple = (start: number, peak: number, end: number): Tracks => ({
  opacity: track([0, 0, 1, 0, 0], [0, start, peak, end, 1], ["linear", "linear", "easeOut", "linear"]),
  scale: track([0.4, 0.4, 1.8, 1.8], [0, peak, end, 1], ENTER_EASE),
});

const stepEnter = (start: number): Tracks => ({
  opacity: track([0, 0, 1, 1], [0, start, start + 0.02, 1], ENTER_EASE),
  y: track([10, 10, 0, 0], [0, start, start + 0.02, 1], ENTER_EASE),
});

const diamondBlink = (start: number): Tracks => ({
  opacity: track(
    [0.9, 0.9, 0.25, 0.9, 0.25, 0.25],
    [0, start, start + 0.06, start + 0.12, start + 0.18, 1],
    DIAMOND_EASE,
  ),
});

const appear = (start: number, end: number, to = 1): Tracks => ({
  opacity: track([0, 0, to, to], [0, start, end, 1], ENTER_EASE),
});

/** Option card losing its selected look as another one is picked. */
const deselect = (start: number, end: number): Tracks => ({
  opacity: track([1, 1, 0, 0], [0, start, end, 1], ENTER_EASE),
});

/** Outline flashed on what an edit changed, so the eye goes from the panel to the site. */
const changeFlash = (start: number): Tracks => ({
  opacity: track(
    [0, 0, 1, 1, 0, 0],
    [0, start, start + 0.01, start + 0.05, start + 0.07, 1],
    ["linear", "easeOut", "linear", "easeInOut", "linear"],
  ),
});

/** Units: panel px for panel-level layers; real (unscaled) px inside each scaled screen. */
export const tl = {
  // Left column stepper
  activeCard: {
    y: track(
      ["0%", "0%", "100%", "100%", "200%", "200%", "0%", "0%"],
      [0, 0.25, 0.2857, 0.6, 0.6357, 0.9607, 0.9964, 1],
      ["linear", "easeInOut", IN_OUT, "easeInOut", IN_OUT, "easeInOut", "linear"],
    ),
  },
  nodeActive: [
    { opacity: track([1, 1, 0, 0, 1, 1], [0, 0.25, 0.275, 0.9643, 0.9929, 1], SCREEN_EASE) },
    { opacity: fadeInOut([0, 0.25, 0.275, 0.6, 0.625, 1], SCREEN_EASE) },
    { opacity: fadeInOut([0, 0.6, 0.625, 0.9643, 0.9929, 1], SCREEN_EASE) },
  ],
  railProgress: [
    {
      opacity: track([1, 1, 0, 0], [0, 0.9571, 0.9929, 1], ["linear", "easeInOut", "linear"]),
      y: track(["0%", "0%", "100%", "100%"], [0, 0.0571, 0.2571, 1]),
    },
    {
      opacity: track([1, 1, 0, 0], [0, 0.9571, 0.9929, 1], ["linear", "easeInOut", "linear"]),
      y: track(["0%", "0%", "100%", "100%"], [0, 0.2786, 0.6, 1]),
    },
  ],

  // Screen 01 · choose a template
  dialog: {
    opacity: fadeInOut([0, 0.0286, 0.0643, 0.8606, 0.8607, 1], DIALOG_EASE),
    y: track([12, 12, 0, 0, 12, 12], [0, 0.0286, 0.0643, 0.8606, 0.8607, 1], DIALOG_EASE),
  },
  pickedCard: {
    y: track([0, 0, -6, -6, 0, 0], [0, 0.1429, 0.1643, 0.8606, 0.8607, 1], DIALOG_EASE),
  },
  pickedRing: { opacity: fadeInOut([0, 0.1429, 0.1643, 0.8606, 0.8607, 1], DIALOG_EASE) },

  // Screen 02 · customize in site settings. The editor is hidden from 0.8607, so its layers simply
  // reset when the loop restarts.
  editor: {
    opacity: fadeInOut([0, 0.2429, 0.2786, 0.8606, 0.8607, 1], ["linear", "easeInOut", IN_OUT, "linear", "linear"]),
    scale: track([0.98, 0.98, 1, 1], [0, 0.2429, 0.2786, 1], ENTER_EASE),
  },
  /** Color palette: Original → Bakery. The site's buttons and the Accent swatch take the new colour. */
  paletteOriginal: deselect(0.3857, 0.4036),
  paletteBakery: appear(0.3857, 0.4036),
  bakeryAccent: {
    opacity: track([0, 0, 1, 1], [0, 0.3857, 0.4107, 1], ["linear", "easeInOut", "linear"]),
  },
  paletteFlash: changeFlash(0.3893),
  /** Font: Original → Editorial. Every site heading turns serif at once (a slow crossfade doubles the text). */
  fontOriginal: deselect(0.4821, 0.5),
  fontEditorial: appear(0.4821, 0.5),
  editorialHeadings: {
    opacity: track([0, 0, 1, 1], [0, 0.4836, 0.4857, 1]),
  },
  fontFlash: changeFlash(0.4857),

  // Screen 03 · publishing
  publishing: { opacity: fadeInOut([0, 0.6036, 0.6321, 0.9643, 0.9964, 1], SCREEN_EASE) },
  dashedPath: appear(0.6171, 0.6771),
  chipUp: {
    y: track([0, 0, -10, 0, 0], [0, 0.6071, 0.7271, 0.8471, 1], ["linear", "easeInOut", "easeInOut", "linear"]),
  },
  chipDown: {
    y: track([0, 0, 10, 0, 0], [0, 0.6071, 0.7271, 0.8471, 1], ["linear", "easeInOut", "easeInOut", "linear"]),
  },
  deployDiamonds: [diamondBlink(0.6071), diamondBlink(0.6321), diamondBlink(0.6571)],
  stepsCard: {
    opacity: track([0, 0, 1, 1], [0, 0.6071, 0.6371, 1], ENTER_EASE),
    y: track([24, 24, 0, 0], [0, 0.6071, 0.6371, 1], ENTER_EASE),
  },
  deploySteps: [0.6246, 0.6306, 0.6366, 0.6426, 0.6486, 0.6546].map(stepEnter),
  stepPulse: (() => {
    const times = [0, 0.6671, 0.7246, 0.727, 0.7271, 0.7846, 0.787, 0.7871, 0.8446, 1];
    const ease: Ease[] = ["linear", "easeOut", "linear", "linear", "easeOut", "linear", "linear", "easeOut", "linear"];
    return {
      opacity: track([0.45, 0.45, 0, 0, 0.45, 0, 0, 0.45, 0, 0], times, ease),
      scale: track([1, 1, 1.9, 1.9, 1, 1.9, 1.9, 1, 1.9, 1.9], times, ease),
    };
  })(),
  /** Figma tweens width 0.4 → 19.1px; we scale a full-width bar instead. */
  progressFill: {
    scaleX: track([0.0213, 0.0213, 1, 1], [0, 0.6521, 0.7871, 1], ["linear", "easeInOut", "linear"]),
  },

  // Screen 03 · website live
  live: { opacity: fadeInOut([0, 0.7929, 0.8286, 0.9643, 0.9964, 1], SCREEN_EASE) },
  successModal: { scale: track([0.94, 0.94, 1, 1], [0, 0.8, 0.8321, 1], ENTER_EASE) },
  modalDots: appear(0.8214, 0.8786, 0.6),
  modalDiamonds: [appear(0.8357, 0.8714, 0.9), appear(0.8643, 0.9, 0.9), appear(0.8929, 0.9286, 0.9)],
  modalSpark: appear(0.8929, 0.9286, 0.6),
  successChip: { scale: track([0.4, 0.4, 1, 1], [0, 0.8179, 0.8571, 1], ["linear", POP, "linear"]) },
  successHalo: {
    opacity: track([0.4, 0.4, 0, 0], [0, 0.8571, 0.9357, 1], ENTER_EASE),
    scale: track([1, 1, 1.7, 1.7], [0, 0.8571, 0.9357, 1], ENTER_EASE),
  },

  // Pointer
  ripples: {
    useTemplate: ripple(0.1821, 0.1857, 0.2179),
    palette: ripple(0.3821, 0.3857, 0.4179),
    font: ripple(0.4786, 0.4821, 0.5143),
    deploy: ripple(0.5821, 0.5857, 0.6179),
  },
  /** Stops: Use template → (hidden) → Bakery palette → Editorial font → Deploy. Offsets from its resting spot. */
  cursor: (() => {
    const pathTimes = [0, 0.1, 0.175, 0.3213, 0.3214, 0.3786, 0.4286, 0.475, 0.525, 0.575, 0.9928, 0.9929, 1];
    const pathEase: Ease[] = [
      "linear", "easeInOut", IN_OUT, "linear", "easeInOut", "linear",
      "easeInOut", "linear", "easeInOut", "linear", "linear", "linear",
    ];
    const pressTimes = [0, 0.1786, 0.1857, 0.1964, 0.3821, 0.3857, 0.3964, 0.4786, 0.4821, 0.4929, 0.5786, 0.5857, 0.5964, 1];
    const pressEase: Ease[] = [
      "linear", "easeOut", "easeOut", IN_OUT, "easeOut", "easeOut", IN_OUT,
      "easeOut", "easeOut", IN_OUT, "easeOut", "easeOut", "linear",
    ];
    return {
      opacity: track(
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 0.0929, 0.1143, 0.2286, 0.25, 0.3286, 0.3464, 0.6143, 0.6357, 1],
        ["linear", "easeOut", IN_OUT, "easeInOut", IN_OUT, "easeOut", IN_OUT, "easeInOut", "linear"],
      ),
      scale: track([1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1], pressTimes, pressEase),
      x: track([0, 0, -413.19, -413.19, -138.5, 61.5, 61.5, 14.5, 14.5, 100.5, 100.5, 0, 0], pathTimes, pathEase),
      y: track([0, 0, 11.14, 11.14, -78.5, -121.5, -121.5, -35.5, -35.5, -306.5, -306.5, 0, 0], pathTimes, pathEase),
    };
  })(),
} satisfies Record<string, Tracks | Tracks[] | Record<string, Tracks>>;
