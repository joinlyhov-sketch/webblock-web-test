/** Editor-shaped skeleton: top bar, left panel, canvas, right panel. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading editor" className="flex h-[calc(100dvh-2*var(--spacing-page))] animate-pulse flex-col gap-3">
      <div className="h-[60px] rounded-[18px] bg-surface" />
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="w-[300px] rounded-[20px] bg-surface" />
        <div className="bg-dot-grid flex-1 rounded-[20px]" />
        <div className="w-[384px] rounded-[20px] bg-surface" />
      </div>
    </div>
  );
}
