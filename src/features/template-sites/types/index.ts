import type { PageData } from "@/features/editor/types";
import type { CleanMonoContent } from "./clean-mono";
import type { EverydayStoreContent } from "./everyday-store";
import type { SweetPastelContent } from "./sweet-pastel";
import type { WarmBoldContent } from "./warm-bold";

export type TemplateSiteSlug = "everyday-store" | "sweet-pastel" | "warm-bold" | "clean-mono" | "jackets" | "keyboards" | "iced-coffee" | "plates";

/** A product as shown on a template website: name, price, image, category only. */
export type SiteProduct = {
  id: string;
  name: string;
  /** API shape: price as a string, e.g. "4.50". Format at render with formatPrice. */
  price: string;
  currency: "USD" | "KHR";
  category: string;
  /** Short line under the name, when the design has one. */
  note?: string;
  imageUrl: string;
};

export type SiteHours = { days: string; hours: string };

export type SiteBusiness = {
  name: string;
  /** Digits as shown, e.g. "012 345 678". Used for a tel: link. */
  phone: string;
  email: string;
  address: string;
  hours: SiteHours[];
};

/** Everything a template site renders, discriminated by template. */
export type TemplateSite =
  | { slug: "everyday-store"; content: EverydayStoreContent }
  | { slug: "sweet-pastel"; content: SweetPastelContent }
  | { slug: "warm-bold"; content: WarmBoldContent }
  | { slug: "clean-mono"; content: CleanMonoContent }
  /** Built on the editor's own site blocks, so its content is the template's starting page. */
  | { slug: "jackets"; content: PageData }
  | { slug: "keyboards"; content: PageData }
  | { slug: "iced-coffee"; content: PageData }
  | { slug: "plates"; content: PageData };
