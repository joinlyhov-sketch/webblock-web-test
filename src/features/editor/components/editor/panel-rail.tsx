"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type RailItem = { label: string; icon: ReactNode; onClick: () => void };

/**
 * A folded side panel: a slim strip with the "show panel" icon on top, then one icon per section.
 * Every icon opens the panel again (at its section).
 */
export function PanelRail({
  label,
  show,
  items,
}: {
  /** Accessible name of the panel, e.g. "Page". */
  label: string;
  show: RailItem;
  items: RailItem[];
}) {
  return (
    <nav aria-label={label} className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-[20px] bg-background py-3 shadow-card">
      <RailButton item={show} expanded={false} />
      <span aria-hidden className="my-1 h-px w-6 bg-border" />
      {items.map((item) => (
        <RailButton key={item.label} item={item} />
      ))}
    </nav>
  );
}

function RailButton({ item, expanded }: { item: RailItem; expanded?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={item.label}
      aria-expanded={expanded}
      title={item.label}
      onClick={item.onClick}
    >
      {item.icon}
    </Button>
  );
}
