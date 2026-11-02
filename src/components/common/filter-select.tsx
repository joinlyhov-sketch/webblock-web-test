"use client";

import { ArrowDown2 } from "iconsax-reactjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlParam } from "@/hooks/use-url-param";
import { cn } from "@/lib/utils";

type PillSelectProps = {
  /** Text before the value, e.g. "Category:". */
  label: string;
  /** "" means the default option ("All"). */
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

// Radix Select reserves "" for "nothing selected"; the default option ("All") is stored as "".
const EMPTY = "__all__";

/** Pill dropdown ("Category: All"). Opens the WebBlock menu, like the card "…" menu. */
export function PillSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: PillSelectProps) {
  return (
    <Select
      value={value || EMPTY}
      onValueChange={(next) => onValueChange(next === EMPTY ? "" : next)}
    >
      <SelectTrigger
        hideIcon
        aria-label={label.replace(/:$/, "")}
        className={cn(
          "inline-flex h-[34px] cursor-pointer justify-start gap-1.5 rounded-full border border-border bg-background px-3.5 text-[13px] leading-[19.5px] font-medium text-foreground-soft transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/25 data-[state=open]:border-primary",
          className,
        )}
      >
        <ArrowDown2 aria-hidden className="size-3.5" />
        <span>{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[180px]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value || EMPTY}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** PillSelect that stores its choice in the URL ("Category: All", "Plan: All"). */
export function FilterSelect({
  param,
  className,
  ...props
}: Omit<PillSelectProps, "onValueChange"> & {
  /** URL search param the choice is stored in. */
  param: string;
}) {
  const { setParam, pending } = useUrlParam();
  return (
    <PillSelect
      {...props}
      onValueChange={(next) => setParam(param, next || null)}
      className={cn(pending && "opacity-70", className)}
    />
  );
}
