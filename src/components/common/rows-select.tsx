"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown2 } from "iconsax-reactjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlParam } from "@/hooks/use-url-param";
import { MAX_PAGE_SIZE } from "@/lib/table-query";
import { cn } from "@/lib/utils";

/** "Rows [10]" box: how many rows the table shows, stored in the URL as `?size=`. */
export function RowsSelect({
  value,
  options = [10, 20, 50],
  defaultSize = 10,
  onChange,
  editable = false,
  className,
}: {
  value: number;
  options?: number[];
  /** Size the page uses without `?size=`; picking it removes the param. */
  defaultSize?: number;
  /** Browser mode: called with the new size instead of changing the URL. */
  onChange?: (size: number) => void;
  /** The box also takes a typed number (1 to MAX_PAGE_SIZE); the arrow still opens `options`. */
  editable?: boolean;
  /** Extra classes for the select box (e.g. `h-11` to match a taller toolbar). */
  className?: string;
}) {
  const { setParam, pending } = useUrlParam();

  function choose(next: number) {
    if (onChange) onChange(next);
    else setParam("size", next === defaultSize ? null : String(next));
  }

  return (
    <div className={cn("flex items-center gap-2", pending && "opacity-70")}>
      <span className="text-[13px] text-placeholder">Rows</span>
      {editable ? (
        <RowsCombo value={value} options={options} onChoose={choose} className={className} />
      ) : (
        <Select value={String(value)} onValueChange={(next) => choose(Number(next))}>
          <SelectTrigger
            aria-label="Rows per page"
            className={cn("h-[34px] w-[70px] cursor-pointer gap-1 rounded-full border border-border bg-background pr-2.5 pl-3.5 text-sm font-medium text-foreground transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 data-[state=open]:border-primary [&_svg]:size-3.5", className)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[96px]">
            {(options.includes(value) ? options : [...options, value].sort((a, b) => a - b)).map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/** Typed number + arrow that opens the preset sizes. Enter or leaving the box applies the number. */
function RowsCombo({
  value,
  options,
  onChoose,
  className,
}: {
  value: number;
  options: number[];
  onChoose: (size: number) => void;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  // What the owner is typing; null shows the current size.
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function commit() {
    if (draft === null) return;
    const typed = Number.parseInt(draft, 10);
    setDraft(null);
    // Anything outside 1–MAX_PAGE_SIZE (or not a number) puts the old size back.
    if (Number.isInteger(typed) && typed >= 1 && typed <= MAX_PAGE_SIZE && typed !== value) onChoose(typed);
  }

  function pick(option: number) {
    setDraft(null);
    setOpen(false);
    if (option !== value) onChoose(option);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      setOpen(false);
    } else if (event.key === "Escape") {
      setDraft(null);
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => rootRef.current?.querySelector<HTMLButtonElement>("[role=option]")?.focus());
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const items = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = event.key === "ArrowDown" ? Math.min(at + 1, items.length - 1) : Math.max(at - 1, 0);
      items[next]?.focus();
    } else if (event.key === "Escape") {
      setOpen(false);
      rootRef.current?.querySelector("input")?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex h-[34px] w-[84px] items-center rounded-full border border-border bg-background transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/25",
          open && "border-primary",
          className,
        )}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`Rows per page, 1 to ${MAX_PAGE_SIZE}`}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, "").slice(0, 3))}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={commit}
          onKeyDown={onInputKeyDown}
          className="h-full w-0 min-w-0 flex-1 rounded-l-full bg-transparent pl-3.5 text-sm font-medium text-foreground tabular-nums outline-none"
        />
        <button
          type="button"
          aria-label="Choose rows per page"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => setOpen((current) => !current)}
          className="flex h-full shrink-0 cursor-pointer items-center rounded-r-full pr-2.5 pl-1 text-foreground-soft outline-none hover:text-foreground"
        >
          <ArrowDown2 aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Rows per page"
          onKeyDown={onListKeyDown}
          className="absolute top-full right-0 z-30 mt-1.5 min-w-[96px] rounded-xl border border-border bg-background p-1 shadow-modal"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => pick(option)}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted",
                  option === value ? "font-semibold text-brand-strong" : "text-foreground",
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
