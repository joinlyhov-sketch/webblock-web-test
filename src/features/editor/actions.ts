"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { requireWebsiteOwner } from "@/lib/auth/session";
import { formFile } from "@/lib/files";
import { checkImage, SITE_IMAGE_RULE } from "@/lib/image-rules";
import { listVersions, restoreVersion, savePageData, sendAiMessage, uploadMedia } from "./api";
import { describeIssue } from "./issue-message";
import { aiPromptSchema, pageDataSchema } from "./schemas";
import type { AiMessage, MediaAsset, PageData, PageVersion } from "./types";

function invalid(error: z.ZodError, data: unknown): ActionResult<never> {
  return { ok: false, message: describeIssue(error.issues[0], data) };
}

// Pages other than the editor. The editor keeps its own state, so a save or upload must not
// re-render it (that was the "Rendering..." flash on every Save draft).
function revalidateWebsiteViews(websiteId: string) {
  revalidatePath(`/websites/${websiteId}/preview`);
  revalidatePath(`/sites/${websiteId}`);
  revalidatePath("/websites");
}

function revalidateWebsite(websiteId: string) {
  revalidatePath(`/websites/${websiteId}/edit`);
  revalidateWebsiteViews(websiteId);
}

/** "Save draft": stores the editor's page document. The live site does not change. */
export async function savePageAction(
  websiteId: string,
  data: PageData,
): Promise<ActionResult<{ savedAt: string }>> {
  await requireWebsiteOwner(websiteId);
  const parsed = pageDataSchema.safeParse(data);
  if (!parsed.success) return invalid(parsed.error, data);
  try {
    const page = await savePageData(websiteId, parsed.data as PageData);
    revalidateWebsiteViews(websiteId);
    return { ok: true, data: { savedAt: page.updatedAt }, message: "Draft saved" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/** "Upload from computer" on an image field: stores the file and returns it for the library. */
export async function uploadMediaAction(websiteId: string, formData: FormData): Promise<ActionResult<MediaAsset>> {
  await requireWebsiteOwner(websiteId);
  const file = formFile(formData, "image");
  if (!file) return { ok: false, message: "Choose an image first." };
  const problem = checkImage(file, SITE_IMAGE_RULE);
  if (problem) return { ok: false, message: problem };
  try {
    const asset = await uploadMedia(websiteId, file);
    // No revalidate: the asset goes back to the media library in the editor's own state.
    return { ok: true, data: asset, message: "Image uploaded" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/** WebBlock AI composer: sends the prompt and returns the assistant's reply. */
export async function askAiAction(websiteId: string, prompt: string): Promise<ActionResult<AiMessage>> {
  await requireWebsiteOwner(websiteId);
  const parsed = aiPromptSchema.safeParse(prompt);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Type what you want to change." };
  try {
    return { ok: true, data: await sendAiMessage(websiteId, parsed.data) };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/** Version history dialog: the deployed versions of this website, newest first. */
export async function listVersionsAction(websiteId: string): Promise<ActionResult<PageVersion[]>> {
  await requireWebsiteOwner(websiteId);
  try {
    return { ok: true, data: await listVersions(websiteId) };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/** "Restore this version": the live site goes back to an old deployed version. */
export async function restoreVersionAction(websiteId: string, versionId: string): Promise<ActionResult<PageVersion[]>> {
  await requireWebsiteOwner(websiteId);
  try {
    await restoreVersion(websiteId, versionId);
    revalidateWebsite(websiteId);
    return { ok: true, data: await listVersions(websiteId), message: "Previous version restored and live" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}
