import { requireWebsiteOwner } from "@/lib/auth/session";
import { getProfileView } from "@/features/account";
import { getWebsite } from "@/features/websites";
import { getNotificationsView } from "@/features/notifications/service";
import { NotificationBell } from "@/features/websites/components/notification-bell";
import { OwnerSidebarShell } from "./owner-sidebar-shell";

/** Owner Portal sidebar. Loads the website and the owner on the server, the shell handles clicks. */
export async function OwnerSidebar({ websiteId }: { websiteId: string }) {
  const user = await requireWebsiteOwner(websiteId);
  const [website, profile, notifications] = await Promise.all([getWebsite(websiteId), getProfileView(user.id), getNotificationsView(user.id)]);
  return (
    <OwnerSidebarShell
      website={{ id: website.id, name: website.name, domain: website.domain, status: website.status }}
      profile={profile}
      notifications={<NotificationBell key="notifications" items={notifications.items.map((item) => ({ ...item, timeLabel: new Date(item.createdAt).toLocaleDateString("en-GB") }))} />}
    />
  );
}
