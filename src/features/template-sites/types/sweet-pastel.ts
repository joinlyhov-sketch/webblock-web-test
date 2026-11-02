import type { SiteBusiness, SiteProduct } from "./index";

export type SweetPastelContent = {
  business: SiteBusiness;
  openNote: string;
  hero: {
    kicker: string;
    titleLines: string[];
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    stickerOne: string;
    stickerTwo: string;
    images: [string, string, string];
  };
  popular: { kicker: string; title: string; viewAll: string; productIds: string[] };
  catalog: {
    kicker: string;
    title: string;
    searchPlaceholder: string;
    categories: string[];
    pageSize: number;
  };
  about: {
    kicker: string;
    title: string;
    body: string;
    imageUrl: string;
    stats: { value: string; label: string }[];
  };
  visit: {
    kicker: string;
    title: string;
    todayLabel: string;
    todayHours: string;
    formTitle: string;
    formIntro: string;
    topics: string[];
    replyNote: string;
  };
  products: SiteProduct[];
  socials: { label: string; href: string }[];
  hoursSummary: string;
};
