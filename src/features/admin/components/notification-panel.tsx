"use client";

import { Avatar } from "@/components/common/avatar";
import { NotificationList, useNotifications, type NotificationEntry } from "@/components/common/notifications";
import { toast } from "@/components/common/toast";
import { formatTimeAgo } from "@/lib/format";
import { markAllNotificationsReadAction, markNotificationReadAction } from "../actions";
import type { AdminNotification } from "../types";

/** Admin notifications in the shared list shape, with the admin read actions. */
export function useAdminNotifications(notifications: AdminNotification[]) {
  const entries: NotificationEntry[] = notifications.map((n) => ({
    id: n.id,
    title: n.actorName,
    message: n.message,
    read: n.readAt !== null,
    createdAt: n.createdAt,
    timeLabel: formatTimeAgo(n.createdAt),
    href: n.link,
    avatar: <Avatar variant="solid" name={n.actorName} src={n.actorAvatarUrl} className="size-10 text-[13px] ring-0" />,
  }));

  return useNotifications(entries, {
    async markAll() {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) toast.error("Couldn't mark as read", result.message);
    },
    async markRead(id) {
      await markNotificationReadAction(id);
    },
  });
}

/** Full-page admin notifications list (/admin/notifications). The bell uses the same rows. */
export function NotificationPanel({ notifications }: { notifications: AdminNotification[] }) {
  const state = useAdminNotifications(notifications);
  return <NotificationList state={state} variant="page" />;
}
