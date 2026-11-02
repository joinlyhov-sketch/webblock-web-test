"use client";

import { useState } from "react";
import { Add, Copy, Trash } from "iconsax-reactjs";
import { cn } from "@/lib/utils";

type Highlight = { text: string };

const MAX_LENGTH = 60;

/**
 * Short bullet lines (hero "Highlights"). Double-click a line to edit it right there: no separate
 * form box. Enter or leaving the box saves, Escape cancels. Used as a Puck custom field.
 */
export function HighlightsField({
  value,
  onChange,
  readOnly,
  max,
}: {
  id?: string;
  value: Highlight[] | undefined;
  onChange: (value: Highlight[]) => void;
  readOnly?: boolean;
  max: number;
}) {
  const items = value ?? [];
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(index: number) {
    if (readOnly) return;
    setDraft(items[index].text);
    setEditing(index);
  }

  function commit(index: number) {
    const next = draft.trim();
    setEditing(null);
    if (!next || next === items[index].text) return;
    onChange(items.map((item, i) => (i === index ? { text: next } : item)));
  }

  function add() {
    onChange([...items, { text: "New highlight" }]);
    // Start editing the new line straight away.
    setDraft("New highlight");
    setEditing(items.length);
  }

  const iconButton =
    "flex size-7 items-center justify-center rounded-lg text-foreground-soft outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-background">
      {items.map((item, index) => (
        <div
          key={index}
          className="group flex min-h-11 items-center gap-1 border-b border-border px-3.5 py-1.5"
        >
          {editing === index ? (
            <input
              autoFocus
              value={draft}
              maxLength={MAX_LENGTH}
              aria-label={`Highlight ${index + 1}`}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={() => commit(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") {
                  setEditing(null);
                }
              }}
              className="h-8 min-w-0 flex-1 rounded-lg bg-primary-soft px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
            />
          ) : (
            <span
              title={readOnly ? undefined : "Double-click to edit"}
              onDoubleClick={() => startEdit(index)}
              className={cn("min-w-0 flex-1 truncate py-1 text-sm text-foreground select-none", !readOnly && "cursor-text")}
            >
              {item.text}
            </span>
          )}
          <button
            type="button"
            aria-label={`Duplicate highlight ${index + 1}`}
            disabled={readOnly || items.length >= max}
            onClick={() => onChange([...items.slice(0, index + 1), { ...item }, ...items.slice(index + 1)])}
            className={iconButton}
          >
            <Copy variant="Outline" aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Delete highlight ${index + 1}`}
            disabled={readOnly}
            onClick={() => {
              setEditing(null);
              onChange(items.filter((_, i) => i !== index));
            }}
            className={iconButton}
          >
            <Trash variant="Outline" aria-hidden className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        aria-label="Add highlight"
        disabled={readOnly || items.length >= max}
        onClick={add}
        className="flex h-11 w-full items-center justify-center text-primary outline-none transition-colors hover:bg-primary-soft focus-visible:bg-primary-soft disabled:pointer-events-none disabled:opacity-50"
      >
        <Add variant="Outline" aria-hidden className="size-5" />
      </button>
    </div>
  );
}
