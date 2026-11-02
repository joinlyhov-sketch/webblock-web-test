"use client";

// The only place that imports recharts. Colours are CSS variables from globals.css, never hex.
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export type TrendPoint = { label: string; value: number };

/**
 * Area line chart (Figma "Revenue"): dashed gridlines, month labels, soft fill, tooltip with the
 * formatted value. `formatted` holds the display text per point (format on the server with lib/format).
 */
export function AreaTrendChart({
  data,
  formatted,
  label,
  height = 248,
  highlightLast = false,
}: {
  data: TrendPoint[];
  formatted: string[];
  label: string;
  height?: number;
  /** Pin the latest point (Figma "Revenue"): dot, dashed guide to the axis, value label shown on load. */
  highlightLast?: boolean;
}) {
  const last = data[data.length - 1];
  return (
    <div role="img" aria-label={label} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 12, bottom: 0, left: 12 }}
        >
          <defs>
            <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            interval={0}
            tick={{ fill: "var(--color-placeholder)", fontSize: 12 }}
          />
          {highlightLast && last && (
            <ReferenceLine
              x={last.label}
              stroke="var(--color-primary)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
          )}
          {highlightLast && last && (
            <ReferenceDot
              x={last.label}
              y={last.value}
              r={5}
              fill="var(--color-background)"
              stroke="var(--color-brand)"
              strokeWidth={2.5}
            />
          )}
          <Tooltip
            defaultIndex={highlightLast ? data.length - 1 : undefined}
            // Value label sits at the top of the chart, above the point (Figma).
            position={highlightLast ? { y: 0 } : undefined}
            cursor={{ stroke: "var(--color-primary)", strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const index = data.findIndex(
                (d) => d.label === payload[0].payload.label,
              );
              return (
                <div className="rounded-[10px] border border-border bg-background px-3.5 py-2 text-center shadow-card">
                  <p className="font-heading text-[15px] font-semibold text-brand">
                    {formatted[index]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payload[0].payload.label}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-brand)"
            strokeWidth={2.5}
            fill="url(#trend-fill)"
            activeDot={{
              r: 5,
              fill: "var(--color-background)",
              stroke: "var(--color-brand)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type DonutSegment = {
  label: string;
  value: number;
  /** A colour token name from globals.css, e.g. "danger", "warning", "primary". */
  color: string;
  /** Makes the legend row a link. */
  href?: string;
};

/** Donut with a big number in the middle (Figma "Needs attention"). */
export function DonutChart({
  segments,
  total,
  caption,
  size = 168,
}: {
  segments: DonutSegment[];
  total: number;
  caption: string;
  size?: number;
}) {
  return (
    <div
      role="img"
      aria-label={`${total} ${caption}: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={1.5}
            stroke="none"
            isAnimationActive={false}
          >
            {segments.map((s) => (
              <Cell key={s.label} fill={`var(--color-${s.color})`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[34px] leading-none font-bold text-foreground">
          {total}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{caption}</span>
      </div>
    </div>
  );
}

const RING_RADIUS = 44;
const RING_WIDTH = 12;

/** SVG arc along the ring from one angle to another, in degrees clockwise from 12 o'clock. */
function arcPath(startDeg: number, endDeg: number) {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${(50 + RING_RADIUS * Math.cos(rad)).toFixed(3)} ${(50 + RING_RADIUS * Math.sin(rad)).toFixed(3)}`;
  };
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${point(startDeg)} A ${RING_RADIUS} ${RING_RADIUS} 0 ${large} 1 ${point(endDeg)}`;
}

/**
 * Legend list (colour, name, count) on the left, ring on the right. The thick ring has rounded, overlapping ends. The middle shows
 * the total, or the count of the slice under the pointer or keyboard focus in the list or on the ring.
 */
export function DonutBreakdown({
  segments,
  size = 176,
  className,
}: {
  segments: DonutSegment[];
  size?: number;
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const [hovered, setHovered] = useState<number | null>(null);
  const current = hovered === null ? null : segments[hovered];
  // Each slice is a round-capped arc. Later slices are drawn over the end of the one before, so the pieces join with no gap.
  const arcs = segments.flatMap((segment, index) => {
    if (!total || segment.value <= 0) return [];
    const before = segments.slice(0, index).reduce((sum, s) => sum + s.value, 0);
    const from = (before / total) * 360;
    const to = ((before + segment.value) / total) * 360;
    return [{ segment, index, path: arcPath(from, Math.min(to, from + 359.99)) }];
  });

  return (
    <div className={cn("flex flex-1 flex-col items-center gap-6 sm:flex-row", className)}>
      <div className="w-full min-w-0 flex-1">
        <ul onMouseLeave={() => setHovered(null)}>
          {segments.map((s, i) => {
            const row = (
              <>
                <span aria-hidden className="size-3 shrink-0 rounded-[4px]" style={{ background: `var(--color-${s.color})` }} />
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">{s.label}</span>
                <span className="text-[15px] font-semibold text-foreground tabular-nums">{s.value}</span>
              </>
            );
            const rowClass = cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              hovered === i ? "bg-muted" : "hover:bg-muted",
            );
            return (
              <li key={s.label} onMouseEnter={() => setHovered(i)}>
                {s.href ? (
                  <Link href={s.href} className={rowClass} onFocus={() => setHovered(i)} onBlur={() => setHovered(null)}>
                    {row}
                  </Link>
                ) : (
                  <div className={rowClass}>{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div
        role="img"
        aria-label={segments.map((s) => `${s.label} ${s.value}`).join(", ")}
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx={50} cy={50} r={RING_RADIUS} fill="none" strokeWidth={RING_WIDTH} className="stroke-muted" />
          {arcs.map(({ segment, index, path }) => (
            <path
              key={segment.label}
              d={path}
              fill="none"
              strokeWidth={hovered === index ? RING_WIDTH + 2 : RING_WIDTH}
              strokeLinecap="round"
              stroke={`var(--color-${segment.color})`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="max-w-full truncate text-sm text-muted-foreground">{current ? current.label : "Total"}</span>
          <span className="mt-1 font-heading text-[34px] leading-none font-bold text-foreground">
            {current ? current.value : total}
          </span>
        </div>
      </div>
    </div>
  );
}
