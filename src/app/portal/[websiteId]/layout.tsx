import type { ReactNode } from "react";
import { OwnerSidebar } from "@/components/layout/owner-sidebar";

export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  return (
    <div data-mobile-ui className="flex min-h-dvh max-lg:flex-col">
      <OwnerSidebar websiteId={websiteId} />
      <main className="dashboard-content flex min-w-0 flex-1 flex-col gap-6 px-page pt-8 pb-12">{children}</main>
    </div>
  );
}
