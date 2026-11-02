import type { ReactNode } from "react";

/** Label + control + hint/error. The control must use `id={id}` and `aria-describedby={`${id}-msg`}`. */
export function Field({
  id,
  label,
  aside,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  aside?: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const message = error ?? hint;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {message && (
        <p id={`${id}-msg`} className={error ? "text-xs text-danger" : "text-xs text-muted-foreground"}>
          {message}
        </p>
      )}
    </div>
  );
}

/** "or" separator between the Google button and the email form. */
export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3.5 text-[13px] text-placeholder">
      <span aria-hidden className="h-px flex-1 bg-border" />
      {label}
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Centred "Question? Link" line under a form. */
export function FormFooter({ children }: { children: ReactNode }) {
  return <p className="text-center text-sm text-muted-foreground">{children}</p>;
}
