import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminProfile, listNotifications } from "../api";
import { AdminProfileMenu } from "./admin-profile-menu";
import { NotificationsBell } from "./notifications-bell";

/** Admin page title row, with the notification bell and the admin profile on the right (Figma "Header actions"). */
export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  /** Extra page actions, shown before the bell. */
  children?: ReactNode;
}) {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        <>
          {children}
          <Suspense fallback={<><Skeleton className="size-10 rounded-full" /><Skeleton className="size-10 rounded-full" /></>}>
            <HeaderActions />
          </Suspense>
        </>
      }
    />
  );
}

async function HeaderActions() {
  await requireAdmin();
  const [notifications, profile] = await Promise.all([
    listNotifications({}, { page: 0, size: 20 }),
    getAdminProfile(),
  ]);

  return <><NotificationsBell notifications={notifications.items} /><AdminProfileMenu profile={profile} /></>;
}
