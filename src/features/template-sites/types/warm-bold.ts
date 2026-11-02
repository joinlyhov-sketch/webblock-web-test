import type { SiteBusiness, SiteProduct } from "./index";

export type WarmBoldSocial = { label: string; url: string };

export type WarmBoldContent = {
  brandName: string;
  business: SiteBusiness;
  /** Short status shown in the header pill, e.g. "Open now · until 17:00". */
  openNowLabel: string;
  hero: {
    imageUrl: string;
    eyebrow: string;
    titleLines: string[];
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    stampLines: [string, string, string];
  };
  facts: string[];
  popular: {
    eyebrow: string;
    title: string;
    viewAllLabel: string;
    featuredLabel: string;
    featuredProductId: string;
    listProductIds: string[];
  };
  shop: {
    eyebrow: string;
    title: string;
    searchPlaceholder: string;
    categories: string[];
    /** Total catalogue size shown in the "Showing x of y" line. */
    totalItems: number;
  };
  about: {
    eyebrow: string;
    quote: string;
    author: string;
    imageUrl: string;
  };
  visit: {
    eyebrow: string;
    title: string;
    mapLabel: string;
  };
  contact: {
    title: string;
    subtitle: string;
    topics: string[];
    replyNote: string;
  };
  footerTagline: string;
  social: WarmBoldSocial[];
  products: SiteProduct[];
};
