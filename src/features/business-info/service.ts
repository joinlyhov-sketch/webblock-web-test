import { mockApi } from "@/lib/mock-state";
// Business details logic. Pages call the read functions, Server Actions call the write functions.
// Nothing here knows whether data comes from the mock or from Spring.
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { formFile, imageToDataUrl } from "@/lib/files";
import { checkImage, LOGO_RULE } from "@/lib/image-rules";
import type { SearchParams } from "@/lib/table-query";
import { formText } from "@/lib/validation/fields";
import { getPageData } from "@/features/editor/api";
import type { PageData } from "@/features/editor/types";
import { getWebsite } from "@/features/websites/api";
import { defaultOpeningHours } from "@/features/websites/schemas";
import type { Website } from "@/features/websites/types";
import { getBusinessInfo, updateBusinessInfo } from "./api";
import { businessInfoInput } from "./schemas";
import type { BusinessInfo } from "./types";

export type BusinessInfoView = {
  info: BusinessInfo;
  website: Pick<Website, "id" | "name" | "businessType" | "domain" | "thumbnailUrl">;
  /**
   * The top of the website for the live preview banner: the draft's root props (header) and its
   * hero (or first section). The draft is what the next deploy puts online. `null` when the
   * website has no page yet: the banner shows the saved screenshot instead.
   */
  preview: PageData | null;
  /** `?edit=1`: the page shows the form instead of the details. */
  editing: boolean;
};

function emptyBusinessInfo(websiteId: string): BusinessInfo {
  return {
    websiteId,
    description: "",
    logoUrl: null,
    phone: "",
    email: "",
    address: "",
    mapsUrl: null,
    hours: defaultOpeningHours(),
    updatedAt: new Date().toISOString(),
  };
}

export const getBusinessInfoView = mockApi(async function getBusinessInfoView(websiteId: string, searchParams: SearchParams): Promise<BusinessInfoView> {
  const [info, website, page] = await Promise.all([
    // A website without a record yet opens with empty details; saving the form creates it.
    getBusinessInfo(websiteId).catch((e: unknown): BusinessInfo => {
      if (e instanceof ApiError && e.status === 404) return emptyBusinessInfo(websiteId);
      throw e;
    }),
    getWebsite(websiteId),
    getPageData(websiteId).catch((e: unknown) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }),
  ]);
  const { id, name, businessType, domain, thumbnailUrl } = website;
  const top = page && (page.draft.content.find((block) => block.type === "Hero") ?? page.draft.content[0]);
  return {
    info,
    website: { id, name, businessType, domain, thumbnailUrl },
    preview: page && { root: page.draft.root, content: top ? [top] : [] },
    editing: searchParams.edit === "1",
  };
});

export const saveBusinessInfo = mockApi(async function saveBusinessInfo(websiteId: string, formData: FormData): Promise<ActionResult> {
  const values = {
    description: formText(formData, "description"),
    phone: formText(formData, "phone"),
    email: formText(formData, "email"),
    address: formText(formData, "address"),
    mapsUrl: formText(formData, "mapsUrl"),
    hours: formText(formData, "hours"),
  };
  const parsed = businessInfoInput.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const logo = formFile(formData, "logo");
  let logoUrl: string | undefined;
  if (logo) {
    const problem = checkImage(logo, LOGO_RULE);
    if (problem) return { ok: false, message: problem, fieldErrors: { logo: [problem] }, values };
    logoUrl = await imageToDataUrl(logo);
  }

  try {
    await updateBusinessInfo(websiteId, { ...parsed.data, logoUrl });
    return { ok: true, data: undefined, message: "Your changes go live on your next deploy." };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values };
    throw e;
  }
});
