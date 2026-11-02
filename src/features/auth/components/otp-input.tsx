"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Six one-digit boxes that submit as a single hidden field. Typing moves forward, Backspace moves
 * back, pasting a code fills every box.
 */
export function OtpInput({
  name,
  length = 6,
  invalid,
  describedBy,
}: {
  name: string;
  length?: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const fill = (start: number, value: string) => {
    const incoming = value.replace(/\D/g, "").slice(0, length - start).split("");
    if (incoming.length === 0) return;
    setDigits((prev) => prev.map((d, i) => (i >= start && i < start + incoming.length ? incoming[i - start] : d)));
    focus(start + incoming.length);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i]) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, j) => (j === i - 1 ? "" : d)));
      focus(i - 1);
    } else if (e.key === "ArrowLeft") {
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      focus(i + 1);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData("text"));
  };

  return (
    <div role="group" aria-label="Verification code" aria-describedby={describedBy} className="flex gap-2.5">
      <input type="hidden" name={name} value={digits.join("")} />
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length > 1) fill(i, value);
            else {
              setDigits((prev) => prev.map((d, j) => (j === i ? value : d)));
              if (value) focus(i + 1);
            }
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-16 w-full max-w-[60px] min-w-0 rounded-[14px] border border-input bg-background text-center font-heading text-[26px] font-semibold text-foreground shadow-button",
            "transition-[border-color,box-shadow] duration-150 outline-none",
            "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/16",
            "aria-invalid:border-danger",
          )}
        />
      ))}
    </div>
  );
}
