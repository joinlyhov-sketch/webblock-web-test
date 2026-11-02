import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error. The control needs `id={id}`; pass `aria-invalid` and
 * `aria-describedby={`${id}-hint`}` on it so screen readers read the message.
 */
export function FormField({
  id,
  label,
  optional,
  hint,
  error,
  className,
  labelClassName,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  /** Overrides the label style, e.g. the 13px label used on the support form. */
  labelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className={cn("block text-sm font-semibold", labelClassName)}>
        {label}
        {optional && <span className="ml-1 font-normal text-placeholder">(optional)</span>}
      </label>
      {children}
      {(error || hint) && (
        <p
          id={`${id}-hint`}
          role={error ? "alert" : undefined}
          className={cn("text-[13px]", error ? "text-danger" : "text-placeholder")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
