import { Skeleton } from "@/components/ui/skeleton";

/** Editor-shaped skeleton: top bar, left panel, canvas, right panel. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading editor" className="flex h-[calc(100dvh-2*var(--spacing-page))] flex-col gap-3">
      <Skeleton className="h-[60px] rounded-[18px] bg-surface" />
      <div className="flex min-h-0 flex-1 gap-3">
        <Skeleton className="w-[300px] rounded-[20px] bg-surface" />
        <Skeleton className="bg-dot-grid flex-1 rounded-[20px]" />
        <Skeleton className="w-[384px] rounded-[20px] bg-surface" />
      </div>
    </div>
  );
}
