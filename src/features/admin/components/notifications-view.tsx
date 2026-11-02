import { Card } from "@/components/common/card";
import type { Page } from "@/lib/api/types";
import type { AdminNotification } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { NotificationPanel } from "./notification-panel";

/** Full notifications page: the same list as the bell popover, without the height limit. */
export function NotificationsView({
  notifications,
}: {
  notifications: Page<AdminNotification>;
}) {
  return (
    <>
      <AdminPageHeader
        title="Notifications"
        description="Deploys, trials and payments that need a look."
      />
      <Card className="mx-auto max-w-3xl overflow-hidden">
        <NotificationPanel notifications={notifications.items} />
      </Card>
    </>
  );
}
