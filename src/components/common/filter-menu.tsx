"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterOption = {
  label: string;
  href: string;
  active: boolean;
  /** Draw a divider above this option (groups like "All admins" / emails / "System"). */
  separatorBefore?: boolean;
};

/**
 * Toolbar filter dropdown: "Status: All ▾". Each option is a link, so the filter lives in the URL.
 * Build the hrefs on the server with `tableHref(searchParams, { status: value, page: null })`.
 */
export function FilterMenu({
  label,
  options,
  className,
}: {
  label: string;
  options: FilterOption[];
  /** Extra classes for the button (e.g. `h-11` to match a taller toolbar). */
  className?: string;
}) {
  const current = options.find((o) => o.active)?.label ?? "All";
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className={cn("font-medium", className)}>
          <ArrowDown2 variant="Outline" aria-hidden />
          {label}: {current}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {options.map((option) => (
          <Fragment key={option.label}>
            {option.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem asChild>
              <Link
                href={option.href}
                scroll={false}
                aria-current={option.active ? "true" : undefined}
                className={cn(option.active && "text-primary")}
              >
                <span className="flex-1">{option.label}</span>
                {option.active && <TickCircle variant="Outline" aria-hidden />}
              </Link>
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
