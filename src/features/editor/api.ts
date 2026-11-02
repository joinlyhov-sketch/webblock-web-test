// Data access for a website's page document. Mock now; when Spring is ready only the function bodies change.
import { ApiError } from "@/lib/api/errors";
import { delay } from "@/lib/api/delay";
import type { Page } from "@/lib/api/types";
import { toPage } from "@/lib/table-query";
import { getBusinessInfo } from "@/features/business-info/api";
import { listProductCategories, listProducts } from "@/features/products/api";
import { getWebsite, touchWebsite } from "@/features/websites/api";
import { fillBusinessData, mediaAssets, uploadedMedia, websitePages } from "@/mocks/website-pages";
import type { AiMessage, MediaAsset, PageData, PageVersion, WebsitePage } from "./types";

function findPage(websiteId: string): WebsitePage {
  const page = websitePages.find((p) => p.websiteId === websiteId);
  if (!page) throw new ApiError({ title: "Page not found", status: 404, detail: "This website has no page yet." });
  return page;
}

/** Mock history of deployed pages. Spring keeps one immutable row per deploy; the draft is a separate record. */
type StoredVersion = { id: string; publishedAt: string; data: PageData };
type History = { versions: StoredVersion[]; currentId: string | null };

const MAX_VERSIONS = 10;
const globalForHistory = globalThis as typeof globalThis & { __wbPageHistory?: Map<string, History> };
const histories = (globalForHistory.__wbPageHistory ??= new Map<string, History>());

/** A website that was live before any history was recorded gets its current page as the first version. */
function historyOf(page: WebsitePage): History {
  let history = histories.get(page.websiteId);
  if (!history) {
    history = { versions: [], currentId: null };
    if (page.published) {
      const id = crypto.randomUUID();
      history.versions.push({ id, publishedAt: page.publishedAt ?? page.updatedAt, data: structuredClone(page.published) });
      history.currentId = id;
    }
    histories.set(page.websiteId, history);
  }
  return history;
}

/** GET /projects/{projectId}/page — the saved draft and the published version. */
export async function getPageData(websiteId: string): Promise<WebsitePage> {
  await delay();
  const page = structuredClone(findPage(websiteId));
  page.draft = await withBusinessData(websiteId, page.draft);
  return page;
}

/**
 * Business information (logo, contacts, opening hours) and Products are managed in the Owner Portal,
 * not in the editor: Spring fills them into the page when it serves the draft and when it deploys
 * (see `fillBusinessData`).
 */
async function withBusinessData(websiteId: string, data: PageData): Promise<PageData> {
  const [info, products, categories] = await Promise.all([
    getBusinessInfo(websiteId).catch(() => null),
    listProducts(websiteId, { page: 0, size: 1000 }).then((page) => page.items),
    listProductCategories(websiteId),
  ]);
  return fillBusinessData(data, { info, products, categories });
}

/**
 * GET /sites/{websiteId} — public: the deployed page that visitors see. 404 until the first deploy, and
 * while the website is suspended (visitors can't see it, as the suspend dialog says).
 */
export async function getPublishedPage(websiteId: string): Promise<PageData> {
  await delay();
  const page = websitePages.find((p) => p.websiteId === websiteId);
  const website = await getWebsite(websiteId).catch(() => null);
  if (!page?.published || website?.status === "SUSPENDED") throw new ApiError({ title: "Site not found", status: 404 });
  return structuredClone(page.published);
}

/** PUT /projects/{projectId}/page { data } — saves the draft. Visitors still see the published version. */
export async function savePageData(websiteId: string, data: PageData): Promise<WebsitePage> {
  await delay();
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  page.draft = structuredClone(data);
  page.updatedAt = now;
  touchWebsite(websiteId, now);
  return structuredClone(page);
}

/**
 * POST /projects/{projectId}/page/publish — asks the backend to deploy the saved draft.
 * The real backend runs the deploy pipeline (and owns retries); the mock publishes instantly.
 * `idempotencyKey` goes in the `Idempotency-Key` header so a double click never deploys twice.
 */
export async function publishPage(websiteId: string, idempotencyKey: string): Promise<WebsitePage> {
  await delay();
  void idempotencyKey;
  const page = findPage(websiteId);
  const now = new Date().toISOString();
  const history = historyOf(page);
  page.published = await withBusinessData(websiteId, structuredClone(page.draft));
  page.publishedAt = now;
  const id = crypto.randomUUID();
  history.versions.unshift({ id, publishedAt: now, data: structuredClone(page.published) });
  history.versions.length = Math.min(history.versions.length, MAX_VERSIONS);
  history.currentId = id;
  return structuredClone(page);
}

/** GET /projects/{projectId}/page/versions — deployed versions, newest first. */
export async function listVersions(websiteId: string): Promise<PageVersion[]> {
  await delay();
  const history = historyOf(findPage(websiteId));
  return history.versions.map((v) => ({ id: v.id, publishedAt: v.publishedAt, current: v.id === history.currentId }));
}

/**
 * POST /projects/{projectId}/page/versions/{versionId}/restore — puts an old deployed version back
 * live. The editor draft is reset to it so the next Save starts from what visitors see.
 */
export async function restoreVersion(websiteId: string, versionId: string): Promise<WebsitePage> {
  await delay(400);
  const page = findPage(websiteId);
  const history = historyOf(page);
  const version = history.versions.find((v) => v.id === versionId);
  if (!version) throw new ApiError({ title: "Version not found", status: 404, detail: "That version is no longer available." });
  page.published = structuredClone(version.data);
  page.draft = structuredClone(version.data);
  page.publishedAt = new Date().toISOString();
  page.updatedAt = page.publishedAt;
  history.currentId = version.id;
  return structuredClone(page);
}

/** GET /projects/{projectId}/media — images the owner can place on the site. */
export async function listMedia(websiteId: string): Promise<Page<MediaAsset>> {
  await delay();
  findPage(websiteId);
  const uploaded = uploadedMedia.filter((m) => m.websiteId === websiteId).map((m) => m.asset);
  return toPage([...uploaded, ...mediaAssets], { page: 0, size: 100 });
}

/**
 * POST /projects/{projectId}/media (multipart) — stores an image from the owner's computer.
 * The backend puts it in storage and returns its URL; the mock keeps the bytes in memory and
 * serves them from /api/mock-media/{id}. Newest uploads come first in the library.
 */
export async function uploadMedia(websiteId: string, file: File): Promise<MediaAsset> {
  await delay(400);
  findPage(websiteId);
  const id = crypto.randomUUID();
  const asset: MediaAsset = { id, url: `/api/mock-media/${id}`, name: file.name };
  uploadedMedia.unshift({ websiteId, asset, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) });
  return structuredClone(asset);
}

/** Mock only: the stored file behind an uploaded image URL. With Spring the URL points at storage. */
export async function getMediaFile(assetId: string): Promise<{ type: string; bytes: Uint8Array }> {
  const upload = uploadedMedia.find((m) => m.asset.id === assetId);
  if (!upload) throw new ApiError({ title: "Image not found", status: 404 });
  return { type: upload.type, bytes: upload.bytes };
}

/**
 * POST /projects/{projectId}/ai/messages { prompt } — asks WebBlock AI to edit the site.
 * The backend runs the model and returns its reply. The mock only answers with a placeholder.
 */
export async function sendAiMessage(websiteId: string, prompt: string): Promise<AiMessage> {
  await delay(700);
  findPage(websiteId);
  void prompt;
  return {
    id: crypto.randomUUID(),
    role: "ASSISTANT",
    text: "WebBlock AI isn’t connected yet, so I can’t change your site from here. You can make this edit in the Content and Layout & Design tabs for now.",
    createdAt: new Date().toISOString(),
  };
}
