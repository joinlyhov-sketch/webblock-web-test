"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRotateLeft } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Website colours the owner can pick (data for their site, not platform styling).
const PRESETS = [
  "#1b2b4b", "#2a5fbd", "#3e6b45", "#b4601e", "#e25c85", "#e53935", "#f2b544", "#7560e6",
  "#ffffff", "#fff8f3", "#f5f8fd", "#eef1ea", "#fbf5e8", "#271b15", "#111111", "#4a2b36",
];

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * One "Accent / Background / Text" chip in Visual style. Opens a popover with preset swatches,
 * a custom colour and "Use palette colour" (back to `null`).
 * `swatch` is the colour the site uses right now (from the template, palette or the override).
 */
export function ColorPicker({
  label,
  value,
  swatchClassName,
  swatchStyle,
  onChange,
}: {
  label: string;
  /** The owner's colour, or null when the palette decides. */
  value: string | null;
  swatchClassName: string;
  swatchStyle?: CSSProperties;
  onChange: (value: string | null) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  return (
    <Popover onOpenChange={(open) => open && setDraft(value ?? "")}>
      <PopoverTrigger
        aria-label={`${label} colour`}
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-1.5 text-xs text-foreground outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/40 data-[state=open]:border-brand"
      >
        <span
          aria-hidden
          style={swatchStyle}
          className={cn("size-[18px] shrink-0 rounded-[5px] border border-border", swatchClassName)}
        />
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-[244px] flex-col gap-3 rounded-[14px] p-3 shadow-menu">
        <p className="text-[13px] font-semibold text-foreground">{label} colour</p>
        <div role="listbox" aria-label={`${label} presets`} className="grid grid-cols-8 gap-1.5">
          {PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              role="option"
              aria-selected={value === color}
              aria-label={color}
              onClick={() => onChange(color)}
              style={{ backgroundColor: color }}
              className={cn(
                "size-6 rounded-md border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                value === color && "ring-2 ring-brand ring-offset-1",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`Custom ${label.toLowerCase()} colour`}
            value={HEX.test(draft) ? draft : value ?? "#000000"}
            onChange={(e) => {
              setDraft(e.target.value);
              onChange(e.target.value);
            }}
            className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-0.5"
          />
          <Input
            aria-label={`${label} hex code`}
            placeholder="#2a5fbd"
            value={draft}
            maxLength={7}
            onChange={(e) => {
              const next = e.target.value.trim();
              setDraft(next);
              if (HEX.test(next)) onChange(next.toLowerCase());
            }}
            aria-invalid={draft !== "" && !HEX.test(draft)}
            className="h-9 text-xs"
          />
        </div>
        <Button variant="ghost" size="sm" disabled={value === null} onClick={() => onChange(null)}>
          <ArrowRotateLeft /> Use palette colour
        </Button>
      </PopoverContent>
    </Popover>
  );
}
