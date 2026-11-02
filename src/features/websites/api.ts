// Data access for websites. Mock now, Spring later: only these function bodies change.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { createBusinessInfo } from "@/features/business-info/api";
import { setSiteOnline } from "@/features/monitoring/api";
import { addTemplateProducts } from "@/features/products/api";
import { toPage } from "@/lib/table-query";
import { businessTypes, websites as seed } from "@/mocks/websites";
import { websiteOwners } from "@/mocks/session";
import { templateCatalogue } from "@/mocks/products";
import { newWebsitePage, websitePages } from "@/mocks/website-pages";
import type { BusinessDetails } from "./types";
import type { Website, WebsiteStatus, WebsiteStatusCounts } from "./types";

const globalForStore = globalThis as typeof globalThis & { __wbWebsites?: Website[] };
const store: Website[] = (globalForStore.__wbWebsites ??= structuredClone(seed));

function ownedBy(ownerId: string): Website[] {
  const ids = new Set(
    websiteOwners.filter((o) => o.ownerId === ownerId).map((o) => o.websiteId),
  );
  return store.filter((w) => ids.has(w.id));
}

export type ListWebsitesFilter = {
  status?: WebsiteStatus;
  q?: string;
};

export async function listWebsites(
  ownerId: string,
  filter: ListWebsitesFilter = {},
): Promise<Page<Website>> {
  await delay();
  const q = filter.q?.trim().toLowerCase();
  const items = ownedBy(ownerId)
    .filter((w) => !filter.status || w.status === filter.status)
    .filter(
      (w) =>
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.businessType.toLowerCase().includes(q) ||
        (w.domain ?? "").includes(q),
    );
  return toPage(items, { page: 0, size: 100 });
}

export async function countWebsites(ownerId: string): Promise<WebsiteStatusCounts> {
  await delay(100);
  const mine = ownedBy(ownerId);
  const count = (status: WebsiteStatus) => mine.filter((w) => w.status === status).length;
  return {
    ALL: mine.length,
    LIVE: count("LIVE"),
    DRAFT: count("DRAFT"),
    SUSPENDED: count("SUSPENDED"),
  };
}

export async function getWebsite(websiteId: string): Promise<Website> {
  await delay(100);
  const website = store.find((w) => w.id === websiteId);
  if (!website) {
    throw new ApiError({ title: "Website not found", status: 404, detail: "That website no longer exists." });
  }
  return website;
}

/** MOCK ONLY: Spring bumps the project's `updatedAt` itself whenever its page draft is saved. */
export function touchWebsite(websiteId: string, at: string): void {
  const website = store.find((w) => w.id === websiteId);
  if (website) website.updatedAt = at;
}

export type CreateWebsiteBody = {
  templateId: string;
  name: string;
  businessType: string;
  category: Website["category"];
  thumbnailUrl: string;
  details: BusinessDetails;
};

export async function createWebsite(ownerId: string, body: CreateWebsiteBody): Promise<Website> {
  await delay(400);
  if (ownedBy(ownerId).some((w) => w.name.toLowerCase() === body.name.toLowerCase())) {
    throw new ApiError({
      title: "Name already used",
      status: 409,
      detail: "You already have a website with this name. Pick a different business name.",
    });
  }
  const website: Website = {
    id: crypto.randomUUID(),
    name: body.name,
    businessType: body.businessType,
    category: body.category,
    status: "DRAFT",
    domain: null,
    templateId: body.templateId,
    thumbnailUrl: body.thumbnailUrl,
    updatedAt: new Date().toISOString(),
    suspendedAt: null,
    reactivatedAt: null,
  };
  store.unshift(website);
  websiteOwners.push({ websiteId: website.id, ownerId });
  const page = newWebsitePage(website.id, website.templateId, website.updatedAt, body.details);
  websitePages.push(page);
  // Spring does these inside the same request: the business details record (Owner Portal → Business
  // information) and the template's sample products (Owner Portal → Products).
  const { details } = body;
  createBusinessInfo({
    websiteId: website.id,
    description: details.description,
    logoUrl: details.logoUrl,
    phone: details.phone,
    email: details.email,
    address: details.address,
    mapsUrl: null,
    hours: details.hours,
  });
  addTemplateProducts(website.id, templateCatalogue(page.draft));
  return website;
}

/** GET /domains/check — is this public host free? A website may keep the host it already owns. */
export async function isDomainTaken(host: string, exceptWebsiteId: string): Promise<boolean> {
  await delay(150);
  return store.some((w) => w.id !== exceptWebsiteId && w.domain === host);
}

/**
 * MOCK ONLY: Spring does this when a deploy finishes. The website goes LIVE on its host.
 * (A suspended website stays suspended: only reactivating it brings it back.)
 */
export async function markWebsiteLive(websiteId: string, domain: string): Promise<Website> {
  const website = await getWebsite(websiteId);
  website.domain = domain;
  if (website.status !== "SUSPENDED") website.status = "LIVE";
  website.updatedAt = new Date().toISOString();
  return website;
}

export async function reactivateWebsite(websiteId: string): Promise<Website> {
  const website = await getWebsite(websiteId);
  await delay(300);
  website.status = "LIVE";
  setSiteOnline(websiteId, true);
  website.suspendedAt = null;
  website.reactivatedAt = new Date().toISOString();
  website.updatedAt = website.reactivatedAt;
  return website;
}

export async function suspendWebsite(websiteId: string): Promise<Website> {
  const website = await getWebsite(websiteId);
  await delay(300);
  website.status = "SUSPENDED";
  setSiteOnline(websiteId, false);
  website.reactivatedAt = null;
  website.suspendedAt = new Date().toISOString();
  website.updatedAt = website.suspendedAt;
  return website;
}

/**
 * DELETE /projects/{projectId} — removes a website that was never deployed.
 * The backend refuses (409) for live or suspended websites; the mock does the same.
 */
export async function deleteWebsite(websiteId: string): Promise<void> {
  const website = await getWebsite(websiteId);
  await delay(300);
  if (website.status !== "DRAFT") {
    throw new ApiError({
      title: "Can't delete this website",
      status: 409,
      detail: "Only draft websites can be deleted. Suspend a live website to take it offline.",
    });
  }
  store.splice(store.indexOf(website), 1);
  const owner = websiteOwners.findIndex((o) => o.websiteId === websiteId);
  if (owner !== -1) websiteOwners.splice(owner, 1);
  const page = websitePages.findIndex((p) => p.websiteId === websiteId);
  if (page !== -1) websitePages.splice(page, 1);
}

export async function listBusinessTypes(): Promise<string[]> {
  return businessTypes;
}
