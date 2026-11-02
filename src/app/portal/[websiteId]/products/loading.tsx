import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div aria-busy className="flex flex-1 flex-col gap-6" role="status">
      <span className="sr-only">Loading products</span>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-40 rounded bg-muted" />
          <Skeleton className="h-5 w-80 rounded bg-muted" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-muted" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-border shadow-table">
        <div className="flex items-center gap-2.5 border-b border-border px-4 pt-14 pb-3.5">
          <Skeleton className="h-9 w-[360px] rounded-full bg-muted" />
          <Skeleton className="h-[42px] w-[400px] rounded-full bg-segment-track" />
        </div>
        <div className="grid gap-6 p-6 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[330px] rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
