import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Input look used on the Settings forms (Figma: 46px tall, 12px radius, 14px text). */
export const SETTINGS_FIELD = "h-[46px] rounded-xl border-border px-3.5 text-sm";

/** White card with an icon, title and subtitle on top, used on the Profile screen. */
export function SettingsCard({
  icon,
  title,
  description,
  className,
  headerClassName,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-[22px] rounded-[20px] border border-border bg-background p-[15px] shadow-surface",
        className,
      )}
    >
      <header className={cn("flex items-center gap-3.5 border-b border-border pb-[18px]", headerClassName)}>
        <span aria-hidden className="flex size-7 shrink-0 items-center justify-center text-brand [&_svg]:size-6">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[17px] leading-[22.1px] font-semibold tracking-[-0.17px]">{title}</h2>
          {description && <p className="pt-1 text-[13px] leading-[19.5px] text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Label, control and helper/error line (Figma: 13px label, 12px helper). */
export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[13px] leading-[19.5px] font-semibold">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-hint`} role={error ? "alert" : undefined} className={cn("text-xs", error ? "text-danger" : "text-hint")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
