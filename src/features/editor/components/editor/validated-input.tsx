"use client";

import { cn } from "@/lib/utils";
import type { FieldMeta } from "../puck-config";
import { ruleMessage } from "./field-rules";

const inputClass =
  "h-10 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground shadow-card outline-none transition-[border-color,box-shadow] placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25";

/**
 * A text input for rows inside lists (products, phones, stats…): stops typing at the schema's limit and
 * shows the schema's message under the field, so a bad value is seen while editing, not at Deploy.
 * Used as a Puck custom field.
 */
export function ValidatedInput({
  id,
  field,
  value,
  onChange,
  readOnly,
}: {
  id: string;
  field: { label?: string; metadata?: unknown };
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const meta = (field.metadata ?? {}) as FieldMeta & { placeholder?: string };
  const text = value ?? "";
  const problem = ruleMessage(meta.rule, text);
  const nearLimit =
    meta.maxLength !== undefined && text.length >= meta.maxLength * 0.8;
  return (
    <div className="flex flex-col gap-1.5">
      <input
        id={id}
        value={text}
        readOnly={readOnly}
        placeholder={meta.placeholder}
        maxLength={meta.maxLength}
        aria-invalid={problem !== null}
        aria-describedby={problem ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, problem ? "border-danger" : "border-border")}
      />
      {(problem || nearLimit) && (
        <p className="flex justify-between gap-2 text-xs">
          <span
            id={`${id}-error`}
            role={problem ? "alert" : undefined}
            className="text-danger"
          >
            {problem}
          </span>
          {nearLimit && (
            <span className="ml-auto text-muted-foreground">
              {text.length} / {meta.maxLength}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
