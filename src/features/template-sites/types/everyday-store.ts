import type { SiteBusiness, SiteProduct } from "./index";

export type EverydayStoreLink = { label: string; href: string };

export type EverydayStoreContent = {
  brand: { name: string; mark: string };
  nav: EverydayStoreLink[];
  statusLabel: string;
  contactLabel: string;
  hero: {
    title: string;
    body: string;
    primaryCta: EverydayStoreLink;
    secondaryCta: EverydayStoreLink;
    imageUrl: string;
    imageAlt: string;
  };
  featured: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    /** Ids of products in `catalog.products`, in display order. */
    productIds: string[];
  };
  catalog: {
    eyebrow: string;
    title: string;
    searchPlaceholder: string;
    categories: string[];
    pageSize: number;
    emptyLabel: string;
    products: SiteProduct[];
  };
  about: { title: string; body: string; imageUrl: string; imageAlt: string };
  visit: {
    eyebrow: string;
    title: string;
    mapLabel: string;
    directionsLabel: string;
  };
  contactForm: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    topicLabel: string;
    topics: string[];
    messageLabel: string;
    messagePlaceholder: string;
    sendLabel: string;
    replyNote: string;
  };
  business: SiteBusiness;
  social: EverydayStoreLink[];
  footerNote: string;
};
