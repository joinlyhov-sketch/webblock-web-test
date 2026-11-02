"use server";

import { requireUser } from "@/lib/auth/session";
import { markAllRead } from "./service";
import type { ActionResult } from "@/lib/actions/result";

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireUser();
  const result = await markAllRead(user.id);
  return result;
}
