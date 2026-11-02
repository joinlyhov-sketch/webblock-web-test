export type NotificationKind = "SUCCESS" | "WARNING" | "INFO";

export type AppNotification = {
  id: string;
  /** Who it is about: a website name or "WebBlock Billing". */
  title: string;
  message: string;
  kind: NotificationKind;
  /** Website screenshot shown as the avatar, or `null` for a plain tinted circle. */
  imageUrl: string | null;
  createdAt: string;
  read: boolean;
};
