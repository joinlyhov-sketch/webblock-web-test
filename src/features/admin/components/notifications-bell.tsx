"use client";

import { NotificationBell } from "@/components/common/notifications";
import type { AdminNotification } from "../types";
import { useAdminNotifications } from "./notification-panel";

/** Header bell (Figma "Header · Notification bell") on the admin pages. */
export function NotificationsBell({ notifications }: { notifications: AdminNotification[] }) {
  const state = useAdminNotifications(notifications);
  return <NotificationBell state={state} className="ml-2" />;
}
