import type { Website } from "@/features/websites/types";
import {
  LANTERN_CAFE_ID,
  MAPLE_AND_RYE_ID,
  NORTHPOINT_AUDIO_ID,
  PETAL_AND_STEM_ID,
} from "./session";
import { daysAgo, hoursAgo } from "./time";

export const websites: Website[] = [
  {
    id: PETAL_AND_STEM_ID,
    name: "Petal & Stem",
    businessType: "Florist",
    category: "HANDMADE",
    status: "LIVE",
    domain: "petalandstem.webblock.com",
    templateId: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c01",
    thumbnailUrl: "/mock/templates/everyday-store.png",
    updatedAt: hoursAgo(2),
    suspendedAt: null,
    reactivatedAt: null,
  },
  {
    id: MAPLE_AND_RYE_ID,
    name: "Maple & Rye Bakery",
    businessType: "Bakery",
    category: "FOOD_BEVERAGES",
    status: "DRAFT",
    domain: null,
    templateId: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c02",
    thumbnailUrl: "/mock/templates/sweet-pastel.png",
    updatedAt: hoursAgo(26),
    suspendedAt: null,
    reactivatedAt: null,
  },
  {
    id: LANTERN_CAFE_ID,
    name: "Lantern Café",
    businessType: "Café",
    category: "FOOD_BEVERAGES",
    status: "DRAFT",
    domain: null,
    templateId: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c03",
    thumbnailUrl: "/mock/templates/warm-bold.png",
    updatedAt: daysAgo(4),
    suspendedAt: null,
    reactivatedAt: null,
  },
  {
    id: NORTHPOINT_AUDIO_ID,
    name: "Northpoint Audio",
    businessType: "Audio store",
    category: "TECHNOLOGY",
    status: "DRAFT",
    domain: null,
    templateId: "c1a7e3f0-4b2d-4a6c-9e18-5d3f7b2a1c04",
    thumbnailUrl: "/mock/templates/clean-mono.png",
    updatedAt: hoursAgo(3),
    suspendedAt: null,
    reactivatedAt: null,
  },
];

/** Business types offered in the "Use template" form. */
export const businessTypes: string[] = [
  "Florist",
  "Bakery",
  "Café",
  "Restaurant",
  "Audio store",
  "Clothing boutique",
  "Gift shop",
  "Photo studio",
  "Salon & spa",
  "Other",
];
