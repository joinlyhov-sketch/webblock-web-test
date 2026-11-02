import { mockApi, mockCollection } from "@/lib/mock-state";
// Data access for the signed-in user's notifications. Mock now, Spring later.
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { notifications as seed } from "@/mocks/notifications";
import type { AppNotification } from "./types";

const store: AppNotification[] = mockCollection("notifications", seed);

export const listNotifications = mockApi(async function listNotifications(userId: string): Promise<Page<AppNotification>> {
  await delay(150);
  void userId; // Spring filters by the signed-in user; the mock has one inbox.
  return toPage(
    [...store].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    { page: 0, size: 50 },
  );
});

export const markAllNotificationsRead = mockApi(async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay(150);
  void userId;
  store.forEach((n) => {
    n.read = true;
  });
});
