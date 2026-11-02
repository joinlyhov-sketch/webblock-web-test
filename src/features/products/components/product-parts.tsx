import type { ReactNode } from "react";
import { Add, Box } from "iconsax-reactjs";

/** Blue icon tile + title + subtitle + close button, shared by the details and form popups. */
export function ProductDialogHeader({
  icon = <Box variant="Outline" />,
  title,
  subtitle,
  onClose,
}: {
  /** Tile icon; a product box by default. */
  icon?: ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-4">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-logo-from to-logo-to text-primary-foreground shadow-logo [&_svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg leading-6 font-semibold text-foreground">{title}</h2>
        <p className="truncate text-xs leading-[18px] text-muted-foreground">{subtitle}</p>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-panel text-primary outline-none transition-colors hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <Add variant="Outline" aria-hidden className="size-4 rotate-45" />
      </button>
    </div>
  );
}

/** Outlined category pill (Figma "Chip"). */
export function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex h-7 items-center rounded-full border border-border bg-background px-3 text-[13px] leading-[19px] font-medium whitespace-nowrap text-foreground-soft">
      {category}
    </span>
  );
}
