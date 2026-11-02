"use server";

import { requireUser } from "@/lib/auth/session";
import {
  changePassword,
  removeAvatar,
  saveAvatar,
  saveProfile,
} from "./service";
import type { ActionResult } from "@/lib/actions/result";
import type { ProfileIdentity } from "./types";

// No revalidatePath: each action returns the new name / photo. The profile card shows it at once and
// tells the sidebar through `announceProfile`, so changing settings never re-renders the layout.

export async function updateProfileAction(
  _prev: ActionResult<ProfileIdentity> | null,
  formData: FormData,
): Promise<ActionResult<ProfileIdentity>> {
  const user = await requireUser();
  return saveProfile(user.id, formData);
}

export async function setPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  return changePassword(user.id, formData);
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<ProfileIdentity>> {
  const user = await requireUser();
  return saveAvatar(user.id, formData);
}

export async function removeAvatarAction(): Promise<ActionResult<ProfileIdentity>> {
  const user = await requireUser();
  return removeAvatar(user.id);
}
