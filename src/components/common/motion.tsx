"use client";

import {
  createContext,
  use,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  MotionConfig,
  motion,
  useAnimate,
  useInView,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The only module that imports `motion/react`. Features use these wrappers, and the two landing
 * demos use the re-exported primitives for their keyframe timelines.
 */
export { motion, useInView, useReducedMotion } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Respects the OS "reduce motion" setting for every animation below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades and rises once when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers the `RevealItem`s inside it once the group scrolls into view. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  /** Starting scale, e.g. 0.96 for cards that settle into place. */
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, scale },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE_OUT } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Springs in from 40% scale once in view (Figma "Bubble" entrance), then bobs gently. The bob is the
 * CSS `animate-landing-float`, so it costs no JavaScript while it loops.
 */
export function Pop({
  children,
  className,
  delay = 0,
  bob = 6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  bob?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={className}
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay }}
    >
      <div
        className="animate-landing-float"
        style={{ "--float-y": `${bob}px`, "--float-delay": `${delay + 0.6}s` } as CSSProperties}
      >
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Endless horizontal loop of `children` (rendered twice). Pauses on hover and while off-screen.
 * `trackClassName` sets the gap; give it a matching right padding so the seam stays even.
 */
export function Marquee({
  children,
  className,
  trackClassName,
  duration = 40,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  duration?: number;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope);
  const reduceMotion = useReducedMotion();
  const controls = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    controls.current = animate(
      scope.current,
      { x: ["0%", "-50%"] },
      { duration, ease: "linear", repeat: Infinity },
    );
    return () => controls.current?.stop();
  }, [animate, scope, duration, reduceMotion]);

  useEffect(() => {
    if (inView) controls.current?.play();
    else controls.current?.pause();
  }, [inView]);

  return (
    <div
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => controls.current?.pause()}
      onPointerLeave={() => inView && controls.current?.play()}
    >
      <div ref={scope} className="flex w-max">
        <div className={cn("flex shrink-0", trackClassName)}>{children}</div>
        <div aria-hidden className={cn("flex shrink-0", trackClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

const LoopContext = createContext(false);

/**
 * Stage for a looping product demo. Its keyframe tracks play only while the stage is on screen
 * (they restart from 0 on each entry, so they stay in sync) and rest on their final frame when the
 * viewer prefers reduced motion. Read the state with `useLoopPlaying()`.
 */
export function LoopStage({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = useReducedMotion();

  return (
    <LoopContext value={inView && !reduceMotion}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </LoopContext>
  );
}

export function useLoopPlaying() {
  return use(LoopContext);
}
