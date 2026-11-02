/** Skeleton of the auth form column while a step loads. */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading" className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex w-full max-w-[424px] animate-pulse flex-col gap-[18px]">
        <div className="h-10 w-3/4 rounded-md bg-surface" />
        <div className="h-5 w-1/2 rounded-md bg-surface" />
        <div className="h-[52px] rounded-[14px] bg-surface" />
        <div className="h-[52px] rounded-[14px] bg-surface" />
        <div className="h-[50px] rounded-full bg-surface" />
      </div>
    </main>
  );
}
