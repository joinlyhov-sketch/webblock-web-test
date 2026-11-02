import type { BusinessInfo } from "@/features/business-info/types";
import type { BlockName, MediaAsset, PageData, Product as SiteProduct, SiteRootProps, WebsitePage } from "@/features/editor/types";
import type { Product } from "@/features/products/types";
import type { BusinessDetails, OpeningHour } from "@/features/websites/types";
import { formatClock } from "@/lib/format";
import { businessInfo } from "./business-info";
import { productCategories, products as productSeed } from "./products";
import { LANTERN_CAFE_ID, MAPLE_AND_RYE_ID, NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { templatePages } from "./template-pages";
import { templateSites } from "./template-sites";
import { daysAgo, hoursAgo } from "./time";

// Kept on globalThis so editor saves survive hot reload and are shared by every route in dev.
const store = globalThis as typeof globalThis & { __wbWebsitePages?: WebsitePage[] };

const SHORT_DAY: Record<OpeningHour["day"], string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

/** "09:00" → "9:00 AM": every time on a website is 12-hour, like the rest of WebBlock. */
const clock = formatClock;

/**
 * Opening hours of the business form as the site's two lines: "9:00 AM – 6:00 PM" and
 * "Mon – Fri 9:00 AM – 6:00 PM · Sat – Sun closed".
 */
export function summarizeHours(hours: OpeningHour[]): { hours: string; hoursDetail: string } {
  const open = hours.find((h) => h.open);
  const groups: { first: string; last: string; text: string }[] = [];
  for (const h of hours) {
    const text = h.open ? `${clock(h.opensAt)} – ${clock(h.closesAt)}` : "closed";
    const last = groups.at(-1);
    if (last && last.text === text) last.last = SHORT_DAY[h.day];
    else groups.push({ first: SHORT_DAY[h.day], last: SHORT_DAY[h.day], text });
  }
  return {
    hours: open ? `${clock(open.opensAt)} – ${clock(open.closesAt)}` : "Closed",
    hoursDetail: groups.map((g) => `${g.first === g.last ? g.first : `${g.first} – ${g.last}`} ${g.text}`).join(" · "),
  };
}

/**
 * What the backend does on "Use template": copy the template's default page into the new website and
 * fill in the business details from the form (name, contacts, opening hours).
 */
export function newWebsitePage(
  websiteId: string,
  templateId: string,
  updatedAt: string,
  details?: BusinessDetails,
): WebsitePage {
  const site = templateSites[templateId];
  if (!site) throw new Error(`Mock: no template page for template ${templateId}`);
  const draft = structuredClone(templatePages[site.slug]);
  if (details) {
    draft.root.props = {
      ...draft.root.props,
      businessName: details.businessName,
      address: details.address,
      email: details.email,
      phones: [{ number: details.phone }],
      ...(details.hours.length > 0 ? summarizeHours(details.hours) : {}),
    } as SiteRootProps;
  }
  return {
    websiteId,
    draft,
    published: null,
    updatedAt,
    publishedAt: null,
  };
}

/** What a website shows that is managed in the Owner Portal, not in the editor. */
export type SiteBusinessData = {
  info: Pick<BusinessInfo, "logoUrl" | "phone" | "email" | "address" | "hours"> | null;
  /** Newest first. */
  products: Pick<Product, "name" | "description" | "price" | "category" | "imageUrl">[];
  categories: string[];
};

const toSiteProduct = ({ name, description, price, category, imageUrl }: SiteBusinessData["products"][number]): SiteProduct =>
  ({ name, description, price, category, imageUrl });

/**
 * Fills a page with what the owner manages in the Owner Portal: the logo, phone, email, address and
 * opening hours from Business information (the editor shows those fields locked), and the products and
 * categories from Products (the editor hides those lists). Product Cards shows the newest products, one
 * row (as many as its columns); All products shows the whole catalogue. Spring does this when it serves
 * the page and when it deploys, so a change in the portal goes live on the next deploy.
 */
export function fillBusinessData(data: PageData, business: SiteBusinessData): PageData {
  const site = data.root.props as SiteRootProps;
  const { info } = business;
  const root = info
    ? {
        ...site,
        logoUrl: info.logoUrl,
        phones: info.phone ? [{ number: info.phone }] : [],
        email: info.email,
        address: info.address,
        ...summarizeHours(info.hours),
      }
    : site;
  const catalogue = business.products.map(toSiteProduct);
  const content = data.content.map((block) => {
    const type = block.type as BlockName;
    if (type === "AllProducts") {
      return {
        ...block,
        props: { ...block.props, products: catalogue, categories: business.categories.map((name) => ({ name })) },
      };
    }
    if (type === "ProductCards") {
      const columns = Number((block.props as { columns?: string }).columns) || 4;
      return { ...block, props: { ...block.props, products: catalogue.slice(0, columns) } };
    }
    return block;
  }) as PageData["content"];
  return { ...data, root: { ...data.root, props: root }, content };
}

/** The seed business data of a website (business-info.ts and products.ts). */
function seedBusinessData(websiteId: string): SiteBusinessData {
  return {
    info: businessInfo.find((b) => b.websiteId === websiteId) ?? null,
    products: productSeed
      .filter((p) => p.websiteId === websiteId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    categories: productCategories[websiteId] ?? [],
  };
}

/** Seed websites: the business name the owner typed in the form, and their portal data on the page. */
function seeded(page: WebsitePage, businessName: string): WebsitePage {
  page.draft.root.props = { ...page.draft.root.props, businessName } as SiteRootProps;
  page.draft = fillBusinessData(page.draft, seedBusinessData(page.websiteId));
  return page;
}

function published(page: WebsitePage, publishedAt: string): WebsitePage {
  return { ...page, published: structuredClone(page.draft), publishedAt };
}

// Template ids match src/mocks/websites.ts.
export const websitePages: WebsitePage[] = (store.__wbWebsitePages ??= [
  published(seeded(newWebsitePage(PETAL_AND_STEM_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01", hoursAgo(2)), "Petal & Stem"), hoursAgo(2)),
  seeded(newWebsitePage(MAPLE_AND_RYE_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c02", hoursAgo(26)), "Maple & Rye Bakery"),
  seeded(newWebsitePage(LANTERN_CAFE_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c03", daysAgo(4)), "Lantern Café"),
  seeded(newWebsitePage(NORTHPOINT_AUDIO_ID, "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c04", hoursAgo(3)), "Northpoint Audio"),
]);

/** The owner's image library (every template photo, standing in for their uploads): names the image in each image field. */
const MEDIA_FILES: [folder: string, files: string[]][] = [
  ["everyday-store", ["hero", "gift-bouquet", "stone-vase", "lily-bunch", "table-arrangement", "spring-tulip-bunch"]],
  ["sweet-pastel", ["cupcake-stand", "strawberry-cupcake", "lemon-tart", "chocolate-fudge-cake", "birthday-box", "cinnamon-roll", "about-baker"]],
  ["warm-bold", ["hero-espresso", "espresso-bag", "cold-brew", "flat-white", "cinnamon-bun", "ceramic-cup", "roaster"]],
  ["clean-mono", ["hero-headphones-white", "over-ear-wireless", "true-wireless-earbuds", "pocket-speaker", "usb-c-cable", "listening-bar"]],
];

export const mediaAssets: MediaAsset[] = MEDIA_FILES.flatMap(([folder, files]) =>
  files.map((file) => ({ folder, file })),
).map(({ folder, file }, i) => ({
  id: `a1c0e2d4-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  url: `/mock/templates/${folder}/${file}.webp`,
  name: `${file}.webp`,
}));

/** Images an owner uploaded from their computer. The mock backend keeps the bytes in memory. */
export type UploadedMedia = { websiteId: string; asset: MediaAsset; type: string; bytes: Uint8Array };

const uploads = globalThis as typeof globalThis & { __wbUploadedMedia?: UploadedMedia[] };
export const uploadedMedia: UploadedMedia[] = (uploads.__wbUploadedMedia ??= []);
