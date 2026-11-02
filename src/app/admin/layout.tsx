import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAdminProfile } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  const profile = await getAdminProfile();
  return (
    // The sidebar stays put; only the page content scrolls.
    <div className="flex h-dvh overflow-hidden">
      <AdminSidebar user={profile} />
      {/* Flex column so a `DataTable fill` can stretch to the bottom of the screen. */}
      <main className="page-motion flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-page pt-7 pb-page">
        {children}
      </main>
    </div>
  );
}
