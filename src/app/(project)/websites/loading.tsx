export default function WebsitesLoading() {
  return (
    <div aria-busy className="flex flex-col gap-[15px]" role="status">
      <span className="sr-only">Loading websites</span>
      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      <div className="h-16 w-72 animate-pulse rounded bg-muted" />
      <div className="flex items-center justify-between">
        <div className="h-11 w-[420px] animate-pulse rounded-full bg-segment-track" />
        <div className="h-11 w-[360px] animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[364px] animate-pulse rounded-[20px] bg-muted" />
        ))}
      </div>
    </div>
  );
}
