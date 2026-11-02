"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/result";
import { requireWebsiteOwner } from "@/lib/auth/session";
import { idempotencyKeySchema } from "./schemas";
import { startDeploy } from "./service";
import type { DeployNext } from "./types";

/**
 * "Deploy" / "Use free address & deploy": asks the backend to publish the saved draft and says where to go
 * next (plans, address picker or progress). The backend owns the pipeline, its retries and the plan
 * limits; this only triggers it. `idempotencyKey` is made once per click so a resubmit never deploys twice.
 */
export async function startDeployAction(
  websiteId: string,
  subdomain: string | null,
  idempotencyKey: string,
): Promise<ActionResult<DeployNext>> {
  const user = await requireWebsiteOwner(websiteId);
  if (!idempotencyKeySchema.safeParse(idempotencyKey).success) {
    return { ok: false, message: "Please try deploying again." };
  }
  const result = await startDeploy(
    user.id,
    websiteId,
    subdomain,
    idempotencyKey,
  );
  if (result.ok && result.data.next === "PROGRESS") {
    revalidatePath("/websites");
    revalidatePath(`/websites/${websiteId}/edit`);
    revalidatePath(`/websites/${websiteId}/preview`);
    revalidatePath("/", "layout");
  }
  return result;
}
