"use server";

import { requireUser } from "@/lib/auth/session";
import { submitSupport, type SupportReceipt } from "./service";
import type { ActionResult } from "@/lib/actions/result";

export async function sendSupportMessageAction(
  _prev: ActionResult<SupportReceipt> | null,
  formData: FormData,
): Promise<ActionResult<SupportReceipt>> {
  const user = await requireUser();
  return submitSupport(user.id, formData);
}
