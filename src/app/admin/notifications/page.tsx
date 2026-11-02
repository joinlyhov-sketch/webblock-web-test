import { listNotifications, NotificationsView } from "@/features/admin";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const notifications = await listNotifications({}, { page: 0, size: 50 });
  return <NotificationsView notifications={notifications} />;
}
