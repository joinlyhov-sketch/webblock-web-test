// Data access for a website's business details. Mock now, Spring later: only these function bodies change.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import { businessInfo as seed } from "@/mocks/business-info";
import type { BusinessInfo } from "./types";

const globalForStore = globalThis as typeof globalThis & { __wbBusinessInfo?: BusinessInfo[] };
const store: BusinessInfo[] = (globalForStore.__wbBusinessInfo ??= structuredClone(seed));

/** GET /projects/{projectId}/business-info */
export async function getBusinessInfo(websiteId: string): Promise<BusinessInfo> {
  await delay();
  const info = store.find((b) => b.websiteId === websiteId);
  if (!info) {
    throw new ApiError({
      title: "Business details not found",
      status: 404,
      detail: "This website has no business details yet.",
    });
  }
  return info;
}

export type BusinessInfoBody = Pick<BusinessInfo, "description" | "phone" | "email" | "address" | "mapsUrl" | "hours"> & {
  /** `undefined` keeps the current logo. */
  logoUrl?: string | null;
};

/** PUT /projects/{projectId}/business-info */
export async function updateBusinessInfo(websiteId: string, body: BusinessInfoBody): Promise<BusinessInfo> {
  await delay(300);
  // PUT creates the record when the website has none yet.
  let info = store.find((b) => b.websiteId === websiteId);
  if (!info) {
    info = { websiteId, description: "", logoUrl: null, phone: "", email: "", address: "", mapsUrl: null, hours: [], updatedAt: "" };
    store.push(info);
  }
  Object.assign(info, {
    description: body.description,
    phone: body.phone,
    email: body.email,
    address: body.address,
    mapsUrl: body.mapsUrl,
    hours: body.hours,
    ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
    updatedAt: new Date().toISOString(),
  });
  return info;
}

/**
 * Mock only: Spring creates this record inside POST /projects ("Use template") from the business
 * details form, so a new website opens Business information with what the owner typed.
 */
export function createBusinessInfo(info: Omit<BusinessInfo, "updatedAt">): BusinessInfo {
  const record: BusinessInfo = { ...info, updatedAt: new Date().toISOString() };
  store.push(record);
  return record;
}
