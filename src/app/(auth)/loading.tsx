import { Skeleton } from "@/components/ui/skeleton";
import { AuthLogo } from "@/features/auth/components/auth-logo";

/** Keep the same form column and responsive showcase footprint as AuthShell. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="max-lg:ml-[calc(100vw-100%)] flex min-h-dvh gap-6 overflow-hidden bg-background p-4 sm:p-6">
      <div className="flex min-w-0 flex-1 flex-col px-2 py-2 sm:px-8">
        <AuthLogo />
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[424px] flex-col gap-[18px]">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-[52px] rounded-[14px]" />
            <Skeleton className="h-[52px] rounded-[14px]" />
            <Skeleton className="h-[50px] rounded-full" />
          </div>
        </main>
      </div>
      <div className="hidden w-[743px] max-w-[46%] shrink-0 flex-col gap-8 rounded-[32px] border border-brand-soft p-10 lg:flex min-[1600px]:p-[55px]">
        <Skeleton className="h-32" />
        <Skeleton className="min-h-48 flex-1 rounded-[20px]" />
        <Skeleton className="h-20 rounded-[20px]" />
      </div>
    </div>
  );
}
