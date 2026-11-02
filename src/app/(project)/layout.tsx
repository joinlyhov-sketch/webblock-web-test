import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      {/* A page that marks itself `data-fit-viewport` (Billing history) fills exactly one screen and only its table scrolls. */}
      <main className="page-motion flex min-w-0 flex-1 flex-col gap-[15px] px-page pt-7 pb-12 has-[[data-fit-viewport]]:h-dvh has-[[data-fit-viewport]]:overflow-y-auto">{children}</main>
    </div>
  );
}
