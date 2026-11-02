import type { SiteBusiness, SiteProduct } from "./index";

export type CleanMonoSocial = { label: string; href: string };

export type CleanMonoContent = {
  business: SiteBusiness;
  /** Short "open now" pill text, e.g. "Open now · until 20:00". */
  openNowLabel: string;
  /** Today's hours as shown on the visit card, e.g. "10:00 – 20:00". */
  todayHours: string;
  hero: {
    eyebrow: string;
    titleLines: string[];
    text: string;
    primaryCta: string;
    secondaryCta: string;
    specs: string[];
    imageUrl: string;
    imageAlt: string;
    counter: string;
    price: string;
    currency: "USD" | "KHR";
  };
  popular: { eyebrow: string; title: string; viewAllLabel: string; productIds: string[] };
  catalog: { eyebrow: string; title: string; totalCount: number; searchPlaceholder: string; categories: string[] };
  products: SiteProduct[];
  about: {
    eyebrow: string;
    statement: string;
    stats: { value: string; label: string }[];
    imageUrl: string;
    imageAlt: string;
    caption: string;
  };
  visit: {
    eyebrow: string;
    title: string;
    mapPinTitle: string;
    mapPinSubtitle: string;
    shortAddress: string;
    form: { title: string; intro: string; topics: string[]; replyNote: string };
  };
  social: CleanMonoSocial[];
  footerNote: string;
};
