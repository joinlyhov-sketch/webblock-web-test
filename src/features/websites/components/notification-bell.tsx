"use client";

import Image from "next/image";
import { LogoMark } from "@/components/common/logo";
import { NotificationBell as Bell, useNotifications } from "@/components/common/notifications";
import { markAllNotificationsReadAction } from "@/features/notifications/actions";
import { siteConfig } from "@/config/site";
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

/** Notifications from the platform itself ("WebBlock Billing", "WebBlock Support"…) rather than about a website. */
const isFromWebBlock = (n: AppNotification) => n.title.startsWith(siteConfig.name);

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
      avatar: isFromWebBlock(n) ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background ring-1 ring-inset ring-border">
          <LogoMark className="h-6" />
        </span>
      ) : (
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
