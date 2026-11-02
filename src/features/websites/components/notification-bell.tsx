"use client";

import Image from "next/image";
import { NotificationBell as Bell, useNotifications } from "@/components/common/notifications";
import { markAllNotificationsReadAction } from "@/features/notifications/actions";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/features/notifications/types";

export type NotificationItem = AppNotification & {
  /** "2 mins ago", formatted on the server so the text is the same everywhere. */
  timeLabel: string;
};

/** Circle colour behind the screenshot, or on its own when there is none. */
const plainAvatar: Record<NotificationKind, string> = {
  SUCCESS: "bg-brand-soft",
  WARNING: "bg-notice-warning-soft",
  INFO: "bg-brand-soft",
};

/** Bell on My Websites: the shared notification bell with the user's notifications. */
export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const state = useNotifications(
    items.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      timeLabel: n.timeLabel,
      avatar: (
        <span className={cn("absolute inset-0", plainAvatar[n.kind])}>
          {n.imageUrl && <Image src={n.imageUrl} alt="" fill unoptimized sizes="40px" className="object-cover object-top" />}
        </span>
      ),
    })),
    {
      async markAll() {
        await markAllNotificationsReadAction();
      },
    },
  );

  return <Bell state={state} />;
}
