"use client";

import type { ComponentType } from "react";
import { AutoField, type Field } from "@puckeditor/core";
import {
  Lock1,
  TextalignCenter,
  TextalignLeft,
  TextalignRight,
} from "iconsax-reactjs";
import { SelectField } from "@/components/common/select-field";
import { cn } from "@/lib/utils";
import type { FieldMeta } from "../puck-config";
import { ruleMessage } from "./field-rules";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground shadow-card outline-none transition-[border-color,box-shadow] placeholder:text-placeholder focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25";

const OPTION_ICON: Record<
  string,
  ComponentType<{ className?: string; "aria-hidden"?: boolean; variant?: "Outline" }>
> = {
  left: TextalignLeft,
  center: TextalignCenter,
  right: TextalignRight,
};

export function fieldMeta(field: Field): FieldMeta {
  return (field.metadata ?? {}) as FieldMeta;
}

/** Figma pill "Option group": a segmented radio group (Columns, Content alignment, Spacing). */
export function OptionGroup({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      className="flex gap-0.5 rounded-full bg-segment p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon =
          label === "Content alignment" ? OPTION_ICON[option.value] : undefined;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              active
                ? "bg-background font-semibold text-brand-strong shadow-button"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon variant="Outline" aria-hidden className="size-4" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * One field in the right panel: label (+ "(optional)", counter) and the matching control.
 * Arrays (products, phones…) and custom fields (images) use Puck's own renderer.
 */
export function FieldControl({
  name,
  field,
  value,
  onChange,
}: {
  name: string;
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const meta = fieldMeta(field);
  const id = `field-${name}`;
  const label = field.label ?? name;
  const text = typeof value === "string" ? value : "";
  const problem =
    field.type === "text" || field.type === "textarea"
      ? ruleMessage(meta.rule, text)
      : null;
  const problemId = `${id}-error`;
  const problemNote = problem && (
    <p id={problemId} role="alert" className="text-xs text-danger">
      {problem}
    </p>
  );

  const labelRow = (
    <div className="flex items-baseline justify-between gap-2">
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="text-[13px] font-semibold text-foreground"
      >
        {label}
        {meta.optional && (
          <span className="font-normal text-placeholder"> (optional)</span>
        )}
      </label>
      {field.type === "radio" && name === "columns" && (
        <span className="text-xs text-muted-foreground">
          Product cards per row
        </span>
      )}
    </div>
  );

  // Business details come from the "Use template" form and can't be changed here.
  if (meta.locked) {
    const lines = Array.isArray(value)
      ? value.map((item) =>
          String((item as Record<string, unknown>).number ?? ""),
        )
      : [text];
    return (
      <div className="flex flex-col gap-2">
        {labelRow}
        {lines.map((line, index) => (
          <input
            key={index}
            id={index === 0 ? id : `${id}-${index}`}
            value={line}
            disabled
            readOnly
            aria-describedby={`${id}-locked`}
            className={cn(
              inputClass,
              "h-10 cursor-not-allowed bg-muted text-muted-foreground shadow-none",
            )}
          />
        ))}
        <p
          id={`${id}-locked`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Lock1 variant="Outline" aria-hidden className="size-3.5" /> From your business details
        </p>
      </div>
    );
  }

  switch (field.type) {
    case "text":
      return (
        <div className="flex flex-col gap-2">
          {labelRow}
          <input
            id={id}
            value={text}
            placeholder={field.placeholder}
            maxLength={meta.maxLength}
            aria-invalid={problem !== null}
            aria-describedby={problem ? problemId : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, "h-10", problem && "border-danger")}
          />
          {problemNote}
        </div>
      );

    case "textarea": {
      const isHeading = name === "heading";
      return (
        <div className="flex flex-col gap-2">
          {labelRow}
          <textarea
            id={id}
            value={text}
            maxLength={meta.maxLength}
            aria-invalid={problem !== null}
            aria-describedby={problem ? problemId : undefined}
            rows={isHeading ? 2 : 3}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              inputClass,
              "resize-y py-3 leading-[1.55]",
              isHeading
                ? "min-h-16 font-heading text-base font-semibold"
                : "min-h-[84px]",
              problem && "border-danger",
            )}
          />
          {problemNote}
          {meta.maxLength && (
            <p
              className="text-right text-xs text-muted-foreground"
              aria-live="polite"
            >
              {text.length} / {meta.maxLength}
            </p>
          )}
        </div>
      );
    }

    case "number":
      return (
        <div className="flex flex-col gap-2">
          {labelRow}
          <input
            id={id}
            type="number"
            min={field.min}
            max={field.max}
            value={typeof value === "number" ? value : ""}
            onChange={(e) =>
              onChange(
                e.target.value === ""
                  ? (field.min ?? 0)
                  : Number(e.target.value),
              )
            }
            className={cn(inputClass, "h-10 w-28")}
          />
        </div>
      );

    case "select":
      return (
        <div className="flex flex-col gap-2">
          {labelRow}
          <SelectField
            id={id}
            value={String(value ?? "")}
            onValueChange={onChange}
            className={cn(inputClass, "h-10")}
            options={field.options.map((o) => ({
              value: String(o.value),
              label: o.label,
            }))}
          />
        </div>
      );

    case "radio":
      return (
        <div className="flex flex-col gap-2">
          {labelRow}
          <OptionGroup
            id={id}
            label={label}
            options={field.options.map((o) => ({
              label: o.label,
              value: String(o.value),
            }))}
            value={String(value ?? "")}
            onChange={onChange}
          />
        </div>
      );

    default:
      // array / object / custom (image): Puck's renderer, inside our label.
      return (
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          className="flex flex-col gap-2"
        >
          <p
            id={`${id}-label`}
            className="text-[13px] font-semibold text-foreground"
          >
            {label}
          </p>
          <AutoField id={id} field={field} value={value} onChange={onChange} />
        </div>
      );
  }
}
