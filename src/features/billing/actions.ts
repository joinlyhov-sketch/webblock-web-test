"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { regeneratePayment, startPayment } from "./service";
import type { ActionResult } from "@/lib/actions/result";

// The sidebar trial card sits in the shared layout, and Settings → Billing lists the orders.
function refreshBilling() {
  revalidatePath("/", "layout");
  revalidatePath("/settings/billing");
  revalidatePath("/billing/plans");
}

/** Creates a pending payment for the chosen plan. The client then opens /billing/pay/<orderId>. */
export async function startPaymentAction(
  plan: string,
  forWebsite?: string,
): Promise<ActionResult<{ orderId: string }>> {
  const user = await requireUser();
  const result = await startPayment(user.id, plan, forWebsite);
  if (result.ok) refreshBilling();
  return result;
}

/** New KHQR code for an expired payment. */
export async function regeneratePaymentAction(orderId: string): Promise<ActionResult<{ orderId: string }>> {
  const user = await requireUser();
  const result = await regeneratePayment(user.id, orderId);
  if (result.ok) refreshBilling();
  return result;
}
