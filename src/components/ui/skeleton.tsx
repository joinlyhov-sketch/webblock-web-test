import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Supply the final content's dimensions; animation respects reduced motion. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-skeleton aria-hidden="true" className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)} />;
}
