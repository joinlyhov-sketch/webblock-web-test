// Page document types. Same shape as the Spring API JSON (the backend stores the Puck data as JSON).
import type { Data } from "@puckeditor/core";
import type { Currency } from "@/lib/format";

/** The seven website designs. Each block renders a different design per template. */
export type TemplateKey =
  | "everyday-store"
  | "sweet-pastel"
  | "warm-bold"
  | "clean-mono"
  | "jackets"
  | "keyboards"
  | "iced-coffee";

/** Whole-site visual style, chosen in "Layout & Design · Visual style". `original` = the template's own. */
export type PaletteKey = "original" | "lavender" | "bakery" | "sage";
export type FontKey = "original" | "editorial" | "clean" | "rounded";
export type ButtonStyleKey = "square" | "rounded" | "pill";

/** Per-block layout options ("Layout & Design · Layout"). */
export type Align = "left" | "center" | "right";
export type Spacing = "tight" | "normal" | "roomy";
export type Columns = "2" | "3" | "4";

/**
 * Where a website button goes. Zero-transaction: only page sections, phone, email or Google Maps.
 * `site-links.ts` turns these into hrefs; there is no free-form URL.
 */
export type CtaAction = "shop" | "visit" | "call" | "email" | "directions";

export type Product = {
  name: string;
  description: string;
  /** Decimal string, e.g. "6.00". Formatted with `formatPrice` and the site currency. */
  price: string;
  category: string;
  imageUrl: string | null;
};

export type Stat = { value: string; label: string };
export type Highlight = { text: string };
export type PhoneNumber = { number: string };
export type Category = { name: string };

/** Root props: business info and the whole-site style. The site header and Contact dialog read these. */
export type SiteRootProps = {
  templateId: TemplateKey;
  businessName: string;
  /** "Open now · until 18:00". Shown as a badge in the header. Empty hides it. */
  statusText: string;
  /** Short hours for info rows, e.g. "9:00 – 18:00". */
  hours: string;
  /** Full week, e.g. "Mon – Fri 9:00 – 18:00 · Sat 9:00 – 13:00 · Sun closed". */
  hoursDetail: string;
  address: string;
  phones: PhoneNumber[];
  email: string;
  /** Telegram username without "@". Empty hides it. */
  telegram: string;
  facebookUrl: string;
  instagramUrl: string;
  /**
   * Round logo in the site header, from Owner Portal → Business information. `null` or missing
   * (older pages) shows the template's own mark instead.
   */
  logoUrl?: string | null;
  currency: Currency;
  palette: PaletteKey;
  /** Owner-picked "#rrggbb" colours that override the palette/template. null = keep it. */
  accentColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  font: FontKey;
  buttonStyle: ButtonStyleKey;
};

type LayoutProps = { align: Align; spacing: Spacing };

export type HeroProps = LayoutProps & {
  /** Small label above the heading. Empty hides it. */
  eyebrow: string;
  heading: string;
  description: string;
  primaryLabel: string;
  primaryAction: CtaAction;
  /** Empty hides the second button. */
  secondaryLabel: string;
  secondaryAction: CtaAction;
  imageUrl: string | null;
  /** Extra images (Candy pastel side photos). */
  sideImages: { imageUrl: string | null; label?: string }[];
  /** Short facts (Rustic roast strip, Studio mono spec row, Candy pastel stickers). */
  highlights: Highlight[];
  /** Badge text (Rustic roast round badge, Studio mono price tag). Empty hides it. */
  badge: string;
};

export type ProductCardsProps = LayoutProps & {
  columns: Columns;
  eyebrow: string;
  heading: string;
  /** "View all products" link to the All products section. Empty hides it. */
  viewAllLabel: string;
  products: Product[];
};

export type AllProductsProps = LayoutProps & {
  columns: Columns;
  eyebrow: string;
  heading: string;
  searchPlaceholder: string;
  categories: Category[];
  products: Product[];
  /** Products per page in the grid. */
  pageSize: number;
};

export type AboutProps = LayoutProps & {
  eyebrow: string;
  heading: string;
  body: string;
  imageUrl: string | null;
  /** Second photo (Midnight glow shows two boards). Optional: older pages don't have it. */
  secondImageUrl?: string | null;
  /** Caption under the photo (Studio mono) or quote attribution (Rustic roast). */
  caption: string;
  stats: Stat[];
};

export type VisitUsProps = LayoutProps & {
  eyebrow: string;
  heading: string;
};

export type FooterProps = LayoutProps & {
  tagline: string;
};

export type TextProps = LayoutProps & {
  eyebrow: string;
  heading: string;
  body: string;
  /** Picture beside the text (Midnight glow). Optional: older pages don't have it. */
  imageUrl?: string | null;
};

/** Block name → props. Keys are the Puck component names stored in the page JSON. */
export type BlockProps = {
  Hero: HeroProps;
  ProductCards: ProductCardsProps;
  AllProducts: AllProductsProps;
  About: AboutProps;
  VisitUs: VisitUsProps;
  Footer: FooterProps;
  Text: TextProps;
};

export type BlockName = keyof BlockProps;

/** The Puck document of one page. Stored by the backend as JSON. */
export type PageData = Data<BlockProps, SiteRootProps>;

/** GET /projects/{projectId}/page */
export type WebsitePage = {
  websiteId: string;
  draft: PageData;
  /** null until the first deploy. */
  published: PageData | null;
  updatedAt: string;
  publishedAt: string | null;
};

/** One deployed version of the page (GET /projects/{projectId}/page/versions). */
export type PageVersion = {
  id: string;
  /** ISO-8601 UTC. When this version went live. */
  publishedAt: string;
  /** True for the version visitors see right now. */
  current: boolean;
};

/** An image the owner can put on the site (GET /projects/{projectId}/media). */
export type MediaAsset = {
  id: string;
  url: string;
  name: string;
};

/** One message in the WebBlock AI chat (POST /projects/{projectId}/ai/messages). */
export type AiMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  createdAt: string;
};
