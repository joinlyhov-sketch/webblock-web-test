import { cn } from "@/lib/utils";

const PIECES = 64;
const COLORS = ["bg-primary", "bg-success", "bg-brand-strong", "bg-tier-pro", "bg-tier-ultra", "bg-status-suspended"];

/**
 * A short confetti shower for a confirmed payment. Pure CSS (see `animate-confetti` in globals.css):
 * every piece's position, timing and colour comes from its index, so the render is stable and the
 * overlay never takes a click. Skipped for people who prefer reduced motion.
 */
export function PaymentConfetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {Array.from({ length: PIECES }, (_, i) => (
        <span
          key={i}
          className={cn(
            "animate-confetti absolute top-0 block",
            COLORS[i % COLORS.length],
            i % 3 === 0 ? "rounded-full" : "rounded-[2px]",
            i % 4 === 0 ? "h-3 w-1.5" : "h-2 w-2.5",
          )}
          style={
            {
              left: `${(i * 37) % 100}%`,
              "--confetti-delay": `${(((i * 53) % 100) / 100) * 0.9}s`,
              "--confetti-duration": `${2.8 + (((i * 29) % 10) / 10) * 1.8}s`,
              "--confetti-drift": `${((i * 41) % 200) - 100}px`,
              "--confetti-spin": `${360 + ((i * 67) % 720)}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
