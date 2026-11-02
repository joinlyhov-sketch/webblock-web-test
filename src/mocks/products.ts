import type { Product } from "@/features/products/types";
import type { PageData, Product as SiteProduct } from "@/features/editor/types";
import { NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { templatePages } from "./template-pages";
import { hoursAgo } from "./time";

const photo = (file: string) => `/mock/template-sites/everyday-store/${file}`;
const flower = (file: string) => `/mock/templates/everyday-store/${file}`;

/**
 * A template's sample catalogue (its All products block, else its Product Cards): what the backend copies
 * into a new website's product list on "Use template". Seeds below use it too, so each site and its
 * Owner Portal start with the same products.
 */
export function templateCatalogue(page: PageData): { products: SiteProduct[]; categories: string[] } {
  const all = page.content.find((block) => block.type === "AllProducts");
  const cards = page.content.find((block) => block.type === "ProductCards");
  const products = ((all ?? cards)?.props as { products?: SiteProduct[] } | undefined)?.products ?? [];
  const named = (all?.props as { categories?: { name: string }[] } | undefined)?.categories?.map((c) => c.name);
  const categories = named?.length ? named : [...new Set(products.map((p) => p.category).filter(Boolean))];
  return { products: structuredClone(products), categories };
}

/** Product categories each website shows as filter tabs and in the product form. */
export const productCategories: Record<string, string[]> = {
  [PETAL_AND_STEM_ID]: ["Flowers", "Bouquets", "Gifts", "Events"],
  // Categories but no products yet: the Products empty state.
  [NORTHPOINT_AUDIO_ID]: templateCatalogue(templatePages["clean-mono"]).categories,
};

type Seed = Pick<Product, "name" | "description" | "category" | "price" | "imageUrl">;

const petalAndStem: Seed[] = [
  {
    name: "Blue lily stem",
    category: "Flowers",
    price: "6.00",
    imageUrl: flower("lily-bunch.webp"),
    description: "A single long-stemmed blue lily, cut fresh each morning. Looks lovely on its own in a slim vase.",
  },
  {
    name: "Gift bouquet",
    category: "Bouquets",
    price: "38.00",
    imageUrl: flower("gift-bouquet.webp"),
    description: "A hand-tied bouquet of seasonal flowers, wrapped in kraft paper with a ribbon and a small card.",
  },
  {
    name: "Lily bunch",
    category: "Flowers",
    price: "16.00",
    imageUrl: flower("lily-bunch.webp"),
    description: "Three lily stems tied by hand. The buds open over a few days and fill the room with a soft scent.",
  },
  {
    name: "Stone vase",
    category: "Gifts",
    price: "24.00",
    imageUrl: flower("stone-vase.webp"),
    description: "A handmade ceramic vase with a matte stone finish. Holds a small bouquet or stands well on its own.",
  },
  {
    name: "Table arrangement",
    category: "Events",
    price: "45.00",
    imageUrl: flower("table-arrangement.webp"),
    description:
      "A low arrangement of seasonal flowers and greenery for dining tables and events. Order two days ahead.",
  },
  {
    name: "Spring tulip bunch",
    category: "Flowers",
    price: "14.00",
    imageUrl: flower("spring-tulip-bunch.webp"),
    description: "This week’s special: ten fresh tulips in soft spring colours, tied with natural twine.",
  },
  {
    name: "Peony bouquet",
    category: "Bouquets",
    price: "42.00",
    imageUrl: flower("gift-bouquet.webp"),
    description: "Full pink peonies with eucalyptus, wrapped in soft paper. Available while peonies are in season.",
  },
  {
    name: "Ceramic bud vase",
    category: "Gifts",
    price: "12.00",
    imageUrl: photo("white-vase.png"),
    description: "A small glazed vase for one or two stems. Fits on a desk, a shelf or a bedside table.",
  },
  {
    name: "Dried grass bunch",
    category: "Flowers",
    price: "18.00",
    imageUrl: flower("hero.webp"),
    description: "Natural dried grasses that keep their shape for months. No water needed.",
  },
  {
    name: "Petal candle",
    category: "Gifts",
    price: "15.00",
    imageUrl: photo("candle.png"),
    description: "A soy wax candle topped with dried petals. Burns for about 30 hours with a light floral scent.",
  },
  {
    name: "Pampas stem",
    category: "Flowers",
    price: "9.00",
    imageUrl: null,
    description: "One tall, fluffy pampas stem in natural beige. Pairs well with the stone vase.",
  },
  {
    name: "Wedding and event centrepiece set with matching aisle flowers and a welcome sign garland",
    category: "Events",
    price: "120.00",
    imageUrl: flower("table-arrangement.webp"),
    description:
      "Five matching centrepieces, aisle flowers and a garland for your welcome sign, designed with you and set up on the day. Talk to us at least three weeks before your event.",
  },
];

let n = 0;
function toProducts(websiteId: string, seeds: Seed[]): Product[] {
  return seeds.map((seed, i) => {
    n += 1;
    return {
      ...seed,
      id: `5e1c0a7b-3f2d-4c6e-9a8b-${String(n).padStart(12, "0")}`,
      websiteId,
      // Newest first in the list: the first seed was added most recently. All inside the account's
      // first 5 days (the trial started `daysAgo(5)` in account.ts).
      createdAt: hoursAgo(6 + i * 7),
      updatedAt: i === 0 ? hoursAgo(2) : hoursAgo(5 + i * 7),
    };
  });
}

/** Only Petal & Stem (the trial's one website) has products: 12 of the trial's 30. */
export const products: Product[] = [...toProducts(PETAL_AND_STEM_ID, petalAndStem)];
