import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return <div className="mb-6 flex items-center justify-between gap-4">
    <div className="space-y-1.5 max-lg:min-w-0">
      <Skeleton className="h-[34.5px] w-48" />
      <Skeleton className="h-[22.5px] w-80 max-w-full" />
    </div>
    <Skeleton className="size-10 rounded-full" />
  </div>;
}

function Frame({ children, className = "" }: { children: ReactNode; className?: string; }) {
  return <div role="status" aria-busy="true" className={`flex min-w-0 flex-1 flex-col ${className}`}>
    <span className="sr-only">Loading content</span>{children}</div>;
}

function Card({ className = "" }: { className?: string; }) {
  return <div className={`rounded-[20px] border border-border p-5 ${className}`}>
    <Skeleton className="h-5 w-36" />
    <Skeleton className="mt-5 h-8 w-24" />
    <Skeleton className="mt-4 h-3 w-3/4" />
  </div>;
}

export function TableSkeleton({ compact = false, stats = 0 }: { compact?: boolean; stats?: number; }) {
  return <Frame>
    <HeaderSkeleton />{stats > 0 && <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: stats }, (_, i) => <Card key={i} />)}</div>}<div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[20px] border border-border shadow-table">
      <div className="flex flex-wrap justify-between gap-3 border-b border-border p-4">
        <Skeleton className="h-11 w-[360px] rounded-full" />
        <Skeleton className="h-9 w-48 rounded-full" />
      </div>
      <Skeleton className={compact ? "h-[34px] rounded-none" : "h-[43px] rounded-none"} />
      <div data-table-skeleton className="flex-1">{Array.from({ length: 8 }, (_, i) => <div key={i} className={`flex items-center gap-6 border-b border-border px-5 ${compact ? "h-12" : "h-[68px]"}`}>{Array.from({ length: 5 }, (_, j) => <Skeleton key={j} className={j === 0 ? "h-3.5 w-6" : "h-3.5 flex-1"} />)}</div>)}</div>
      <div className="flex h-16 items-center justify-between border-t border-border px-5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-52 rounded-full" />
      </div>
    </div>
  </Frame>;
}

export function WebsitesSkeleton() {
  return <Frame className="gap-[15px]">
    <HeaderSkeleton />
    <div className="flex flex-wrap justify-between gap-3">
      <Skeleton className="h-[42px] w-[420px] rounded-full" />
      <Skeleton className="h-11 w-[360px] rounded-full" />
    </div>
    <div className="grid gap-4 pt-1 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="overflow-hidden rounded-[20px] border border-border p-3">
      <Skeleton className="h-[200px] rounded-[14px]" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
    </div>)}</div>
  </Frame>;
}

export function TemplatesSkeleton() {
  return <Frame className="gap-[15px]">
    <section className="relative h-[357px] shrink-0 rounded-[28px] border border-border bg-muted/30">
      <div className="mx-auto flex max-w-[560px] flex-col items-center px-4 pt-[29px]">
        <Skeleton className="h-7 w-72 rounded-full" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-2.5 h-12 w-full" />
        <Skeleton className="absolute top-[226px] h-14 w-[calc(100%-32px)] max-w-[528px] rounded-full" />
      </div>
    </section>
    <div className="flex h-[38px] items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-44 rounded-full" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="overflow-hidden rounded-[20px] border border-border p-3">
      <Skeleton className="h-[200px] rounded-[14px]" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>)}</div>
  </Frame>;
}

export function DashboardSkeleton({ admin = false }: { admin?: boolean; }) {
  return <Frame className="gap-6">
    <HeaderSkeleton />
    <div className={`grid gap-4 ${admin ? "sm:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-[2fr_1fr_1fr]"}`}>{Array.from({ length: admin ? 4 : 3 }, (_, i) => <Card key={i} className="min-h-[150px]" />)}</div>
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card className="h-[280px]" />
      <Card className="h-[280px]" />
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-[260px]" />
      <Card className="h-[260px]" />
    </div>
  </Frame>;
}

export function SettingsSkeleton({ billing = false }: { billing?: boolean; }) {
  return <Frame className="gap-[15px]">
    <HeaderSkeleton />
    <Skeleton className="mb-3 h-11 w-60 rounded-full" />{billing ? <>
      <div className="grid gap-4 xl:grid-cols-[465px_minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="h-[202px]" />
        <Card className="h-[202px]" />
        <Card className="h-[202px]" />
      </div>
      <TableSkeleton />
    </> : <div className="flex flex-col items-start gap-[15px] xl:flex-row">
      <div className="w-full rounded-[20px] border border-border p-6 xl:w-[684px]">
        <Skeleton className="mx-auto mb-6 size-[76px] rounded-full" />{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="mb-5 h-[70px]" />)}<Skeleton className="h-[46px] rounded-full" />
      </div>
      <div className="flex w-full flex-1 flex-col gap-[15px]">
        <Card className="h-[260px]" />
        <Card className="h-[320px]" />
      </div>
    </div>}</Frame>;
}

export function InfoSkeleton({ support = false }: { support?: boolean; }) {
  return <Frame className="gap-6">
    <HeaderSkeleton />{!support && <Card className="h-[104px]" />}<div className={`grid items-start gap-4 ${support ? "lg:grid-cols-[1.4fr_1fr]" : "lg:grid-cols-[1.35fr_1fr]"}`}>
      <div className="rounded-[20px] border border-border p-5">
        <Skeleton className="mb-6 h-6 w-48" />{Array.from({ length: support ? 4 : 6 }, (_, i) => <div key={i} className="mb-5 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className={support ? "h-[52px]" : "h-5 w-3/4"} />
        </div>)}{support && <Skeleton className="h-28" />}</div>
      <div className="space-y-4">
        <Card className="h-[360px]" />{support && <Card className="h-[180px]" />}</div>
    </div>
  </Frame>;
}

export function BillingSkeleton({ payment = false }: { payment?: boolean; }) {
  return <Frame className="h-dvh overflow-auto">
    <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-8">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-8 w-48 rounded-full" />
    </div>
    <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center gap-5 px-6 py-12">
      <Skeleton className="h-8 w-40 rounded-full" />
      <Skeleton className="h-12 w-full max-w-[600px]" />
      <Skeleton className="h-5 w-full max-w-[700px]" />
      <div className={`grid w-full gap-5 pt-5 ${payment ? "max-w-[940px] md:grid-cols-2" : "md:grid-cols-3"}`}>{Array.from({ length: payment ? 2 : 3 }, (_, i) => <Card key={i} className="h-[480px]" />)}</div>
    </div>
  </Frame>;
}

export function PreviewSkeleton() {
  return <Frame className="gap-3">
    <Skeleton className="h-[60px] shrink-0 rounded-[18px]" />
    <Skeleton className="min-h-[calc(100dvh-120px)] rounded-[20px]" />
  </Frame>;
}

/** Default for list routes; other layouts select their matching skeleton below the route. */
export function PageSkeleton() { return <TableSkeleton />; }

export function PricingSkeleton() {
  return <section role="status" aria-busy="true" aria-label="Loading plans" className="px-4 py-20 sm:px-6 lg:py-24">
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
      <Skeleton className="h-[46px] w-full max-w-[600px]" />
      <div className="grid w-full max-w-[1260px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Card key={i} className="mx-auto h-[540px] w-full max-w-[400px] xl:max-w-none" />)}</div>
    </div>
  </section>;
}
