// Keyframes of the Figma "04 Seven blocks" editor prototype (one 14s loop). Times are 0–1 of the
// loop; values and easings are copied from the Figma motion context. Offsets (x / y) are relative to
// each layer's laid-out position, as in Figma.
import type { TrackSpec } from "./editor-track";

const STEP = [0.5, 0, 0.5, 1] as [number, number, number, number];
const SETTLE = [0.45, 1.45, 0.8, 1] as [number, number, number, number];

/** Click ripple: flashes in and grows from 40% to 180%. */
function ripple(start: number, flash: number, end: number): TrackSpec {
  const scale = {
    values: [0.4, 0.4, 1.8, 1.8],
    times: [0, flash, end, 1],
    ease: ["linear", "easeOut", "linear"],
  } satisfies TrackSpec[string];
  return {
    opacity: {
      values: [0, 0, 1, 0, 0],
      times: [0, start, flash, end, 1],
      ease: ["linear", "linear", "easeOut", "linear"],
    },
    scaleX: scale,
    scaleY: scale,
  };
}

/** Typing-indicator dot: blinks twice, staggered by `offset`. */
function typingDot(offset: number): TrackSpec {
  const t = (n: number) => +(n + offset).toFixed(4);
  return {
    opacity: {
      values: [0.35, 0.35, 1, 0.35, 1, 0.35, 0.35],
      times: [0, t(0.6), t(0.6129), t(0.6257), t(0.6386), t(0.6514), 1],
      ease: ["linear", "easeInOut", "easeInOut", "easeInOut", "easeInOut", "linear"],
    },
  };
}

export const editorTimeline = {
  /** Page-structure row for the new Text block. */
  textRow: {
    opacity: { values: [0, 0, 1, 1], times: [0, 0.2214, 0.2464, 1], ease: ["linear", "easeOut", "linear"] },
  },
  /** Rows below the new Text row (and the "Add a block" list) slide down to make room. */
  rowsBelow: {
    y: { values: [-28.148, -28.148, 0, 0], times: [0, 0.2143, 0.2357, 1], ease: ["linear", "easeInOut", "linear"] },
  },
  /** Text block dropped onto the canvas. */
  droppedText: {
    opacity: { values: [0, 0, 1, 1], times: [0, 0.2107, 0.2393, 1], ease: ["linear", "easeOut", "linear"] },
    scaleX: { values: [0.97, 0.97, 1, 1], times: [0, 0.2107, 0.2429, 1], ease: ["linear", SETTLE, "linear"] },
    scaleY: { values: [0.97, 0.97, 1, 1], times: [0, 0.2107, 0.2429, 1], ease: ["linear", SETTLE, "linear"] },
  },
  /** Site blocks below the drop point move down by the Text block's height. */
  blocksBelow: {
    y: { values: [-89.37, -89.37, 0, 0], times: [0, 0.1571, 0.1857, 1], ease: ["linear", "easeInOut", "linear"] },
  },
  dropZone: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.1643, 0.1786, 0.2107, 0.225, 1],
      ease: ["linear", "easeOut", STEP, "easeOut", "linear"],
    },
  },
  heroAfterAi: {
    opacity: { values: [0, 0, 1, 1], times: [0, 0.6786, 0.7143, 1], ease: ["linear", "easeInOut", "linear"] },
  },
  aiRing: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.6786, 0.7, 0.8286, 0.8571, 1],
      ease: ["linear", "easeOut", STEP, "easeInOut", "linear"],
    },
  },
  userMessage: {
    opacity: { values: [0, 0, 1, 1], times: [0, 0.5607, 0.5786, 1], ease: ["linear", "easeOut", "linear"] },
    y: { values: [10, 10, 0, 0], times: [0, 0.5607, 0.5821, 1], ease: ["linear", "easeOut", "linear"] },
  },
  aiResponse: {
    opacity: { values: [0, 0, 1, 1], times: [0, 0.6571, 0.675, 1], ease: ["linear", "easeOut", "linear"] },
    y: { values: [10, 10, 0, 0], times: [0, 0.6571, 0.6786, 1], ease: ["linear", "easeOut", "linear"] },
  },
  aiTyping: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.5893, 0.6, 0.65, 0.6571, 1],
      ease: ["linear", "easeOut", STEP, "easeOut", "linear"],
    },
  },
  typingDots: [typingDot(0), typingDot(0.0086), typingDot(0.0171)],
  promptPlaceholder: {
    opacity: {
      values: [1, 1, 0, 0, 1, 1],
      times: [0, 0.4285, 0.4286, 0.5607, 0.5679, 1],
      ease: ["linear", "linear", STEP, "easeOut", "linear"],
    },
  },
  /** Figma tweens the width 1→133px; a clip reveal keeps the text unsquashed. */
  typedText: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.4285, 0.4286, 0.5606, 0.5607, 1],
      ease: ["linear", "linear", STEP, "linear", "linear"],
    },
    clipPath: {
      values: ["inset(0 132px 0 0)", "inset(0 132px 0 0)", "inset(0 0px 0 0)", "inset(0 0px 0 0)"],
      times: [0, 0.4286, 0.5214, 1],
      ease: "linear",
    },
  },
  dragGhost: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.1107, 0.1214, 0.2107, 0.2214, 1],
      ease: ["linear", "easeOut", STEP, "easeOut", "linear"],
    },
    rotate: {
      values: [0, 0, 3, 3, 0, 0],
      times: [0, 0.1107, 0.1286, 0.2036, 0.2143, 1],
      ease: ["linear", "easeOut", STEP, "easeOut", "linear"],
    },
    x: {
      values: [0, 0, 6, 464.445, 464.445],
      times: [0, 0.1107, 0.1214, 0.2036, 1],
      ease: ["linear", "easeOut", "easeInOut", "linear"],
    },
    y: {
      values: [-28.148, -28.148, -34.148, -52.249, -52.249],
      times: [0, 0.1107, 0.1214, 0.2036, 1],
      ease: ["linear", "easeOut", "easeInOut", "linear"],
    },
  },
  rippleText: ripple(0.1071, 0.1107, 0.1429),
  ripplePrompt: ripple(0.4143, 0.4179, 0.45),
  rippleSend: ripple(0.5486, 0.5521, 0.5843),
  cursor: {
    opacity: {
      values: [0, 0, 1, 1, 0, 0],
      times: [0, 0.0429, 0.0643, 0.5679, 0.5929, 1],
      ease: ["linear", "easeOut", STEP, "easeInOut", "linear"],
    },
    scale: {
      values: [1, 1, 0.85, 1, 1, 0.85, 1, 1, 0.85, 1, 1, 0.85, 1, 1],
      times: [0, 0.1036, 0.1086, 0.1179, 0.2071, 0.2121, 0.2214, 0.4107, 0.4157, 0.425, 0.5443, 0.55, 0.5586, 1],
      ease: [
        "linear", "easeOut", "easeOut", STEP, "easeOut", "easeOut", STEP,
        "easeOut", "easeOut", STEP, "easeOut", "easeOut", "linear",
      ],
    },
    x: {
      values: [524.445, 524.445, 0, 0, 464.445, 464.445, 534.445, 534.445, 887.963, 887.963, 897.963, 897.963, 1064.703, 1064.703],
      times: [0, 0.0429, 0.1036, 0.1179, 0.2036, 0.2143, 0.2571, 0.35, 0.4071, 0.4214, 0.4429, 0.5143, 0.5429, 1],
      ease: [
        "linear", "easeInOut", STEP, "easeInOut", STEP, "easeInOut", STEP,
        "easeInOut", STEP, "easeOut", STEP, "easeInOut", "linear",
      ],
    },
    y: {
      values: [125.899, 125.899, 0, 0, -24.101, -24.101, 25.899, 25.899, 381.584, 381.584, 347.584, 347.584, 381.584, 381.584],
      times: [0, 0.0429, 0.1036, 0.1179, 0.2036, 0.2143, 0.2571, 0.35, 0.4071, 0.4214, 0.4429, 0.5143, 0.5429, 1],
      ease: [
        "linear", "easeInOut", STEP, "easeInOut", STEP, "easeInOut", STEP,
        "easeInOut", STEP, "easeOut", STEP, "easeInOut", "linear",
      ],
    },
  },
  /** Covers the editor while the loop resets. */
  loopVeil: {
    opacity: {
      values: [1, 0, 0, 1, 1],
      times: [0, 0.0321, 0.9607, 0.9964, 1],
      ease: ["easeOut", STEP, "easeInOut", "linear"],
    },
  },
} satisfies Record<string, TrackSpec | TrackSpec[]>;
