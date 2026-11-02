import { mockApi } from "@/lib/mock-state";
// Website logic. Pages call the read functions, Server Actions call the write functions.
// Nothing here knows whether data comes from the mock or from Spring.
import type { ActionResult } from "@/lib/actions/result";
import {
  createWebsite,
  deleteWebsite,
  suspendWebsite,
  listBusinessTypes,
  listWebsites,
  countWebsites,
  reactivateWebsite,
} from "./api";
import { getTemplate } from "@/features/templates/api";
import { ApiError } from "@/lib/api/errors";
import { formFile, imageToDataUrl } from "@/lib/files";
import { checkImage, LOGO_RULE } from "@/lib/image-rules";
import type { SearchParams } from "@/lib/table-query";
import { formText } from "@/lib/validation/fields";
import {
  validateBusinessContact,
  validateBusinessDetails,
} from "./schemas";
import type { OpeningHour } from "./types";
import type { Website, WebsiteStatus, WebsiteStatusCounts } from "./types";

export type StatusFilter = "ALL" | WebsiteStatus;

export type WebsitesView = {
  websites: Website[];
  counts: WebsiteStatusCounts;
  status: StatusFilter;
  q: string;
  /** True when the user has no websites at all (not just none matching the filter). */
  isEmpty: boolean;
};

const STATUS_BY_PARAM: Record<string, WebsiteStatus> = {
  live: "LIVE",
  draft: "DRAFT",
  suspended: "SUSPENDED",
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Starting filter read from the URL, so a shared or refreshed link opens on the same tab and search. */
export function parseInitialFilter(searchParams: SearchParams): { status: StatusFilter; q: string } {
  return { status: STATUS_BY_PARAM[first(searchParams.status)] ?? "ALL", q: first(searchParams.q).trim() };
}

/** Every website of the owner. The My Websites screen filters this list in the browser. */
export const getAllWebsites = mockApi(async function getAllWebsites(ownerId: string): Promise<Website[]> {
  const page = await listWebsites(ownerId, {});
  return page.items;
});

export const getWebsitesView = mockApi(async function getWebsitesView(
  ownerId: string,
  searchParams: SearchParams,
): Promise<WebsitesView> {
  const status = STATUS_BY_PARAM[first(searchParams.status)];
  const q = first(searchParams.q).trim();
  const [page, counts] = await Promise.all([
    listWebsites(ownerId, { status, q }),
    countWebsites(ownerId),
  ]);
  return {
    websites: page.items,
    counts,
    status: status ?? "ALL",
    q,
    isEmpty: counts.ALL === 0,
  };
});

export const getBusinessTypes = mockApi(async function getBusinessTypes(): Promise<string[]> {
  return listBusinessTypes();
});

function parseHours(raw: string): OpeningHour[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OpeningHour[]) : [];
  } catch {
    return [];
  }
}

/** Creates a draft website from a template and the business form. Returns the new website id. */
export const createWebsiteFromTemplate = mockApi(async function createWebsiteFromTemplate(
  ownerId: string,
  templateId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const values = {
    businessName: formText(formData, "businessName"),
    businessType: formText(formData, "businessType"),
    description: formText(formData, "description"),
    phone: formText(formData, "phone"),
    email: formText(formData, "email"),
    address: formText(formData, "address"),
    hours: formText(formData, "hours"),
  };

  const details = validateBusinessDetails(values);
  const contact = validateBusinessContact({ ...values, hours: parseHours(values.hours) });
  if (!details.ok || !contact.ok) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        ...(details.ok ? {} : details.fieldErrors),
        ...(contact.ok ? {} : contact.fieldErrors),
      },
      values,
    };
  }

  const logo = formFile(formData, "logo");
  let logoUrl: string | null = null;
  if (logo) {
    const problem = checkImage(logo, LOGO_RULE);
    if (problem) return { ok: false, message: problem, fieldErrors: { logo: [problem] }, values };
    logoUrl = await imageToDataUrl(logo);
  }

  try {
    const template = await getTemplate(templateId);
    const website = await createWebsite(ownerId, {
      templateId: template.id,
      name: details.data.businessName,
      businessType: details.data.businessType,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      details: { ...details.data, ...contact.data, logoUrl },
    });
    return { ok: true, data: { id: website.id }, message: `${website.name} is ready to edit` };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values };
    throw e;
  }
});

export const reactivate = mockApi(async function reactivate(websiteId: string): Promise<ActionResult> {
  try {
    const website = await reactivateWebsite(websiteId);
    return { ok: true, data: undefined, message: `${website.name} is live again` };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
});

export const remove = mockApi(async function remove(websiteId: string): Promise<ActionResult> {
  try {
    await deleteWebsite(websiteId);
    return { ok: true, data: undefined, message: "Website deleted" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
});

export const suspend = mockApi(async function suspend(websiteId: string): Promise<ActionResult> {
  try {
    const website = await suspendWebsite(websiteId);
    return { ok: true, data: undefined, message: `${website.name} is offline` };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
});
