import type { PageData, Product } from "@/features/editor/types";

const IMG = "/mock/templates/everyday-store";

const popular: Product[] = [
  { name: "Blue lily stem", description: "Single, long-stemmed", price: "6.00", category: "Flowers", imageUrl: `${IMG}/hero.webp` },
  { name: "Gift bouquet", description: "Wrapped and ready to give", price: "38.00", category: "Gifts", imageUrl: `${IMG}/gift-bouquet.webp` },
  { name: "Stone vase", description: "Handmade ceramic", price: "24.00", category: "Gifts", imageUrl: `${IMG}/stone-vase.webp` },
  { name: "Lily bunch", description: "Three stems, hand-tied", price: "16.00", category: "Bouquets", imageUrl: `${IMG}/lily-bunch.webp` },
];

const allProducts: Product[] = [
  popular[0],
  popular[1],
  popular[3],
  popular[2],
  { name: "Table arrangement", description: "For home or events", price: "45.00", category: "Events", imageUrl: `${IMG}/table-arrangement.webp` },
  { name: "Spring tulip bunch", description: "This week's special", price: "14.00", category: "Bouquets", imageUrl: `${IMG}/spring-tulip-bunch.webp` },
  { name: "Peony bouquet", description: "Soft pink, seasonal", price: "32.00", category: "Bouquets", imageUrl: `${IMG}/table-arrangement.webp` },
  { name: "Dried grass bunch", description: "Lasts for months", price: "18.00", category: "Flowers", imageUrl: `${IMG}/spring-tulip-bunch.webp` },
  { name: "Ceramic bud vase", description: "Hand-thrown, matte glaze", price: "22.00", category: "Gifts", imageUrl: `${IMG}/stone-vase.webp` },
  { name: "Pampas stem", description: "Dried, long-lasting", price: "12.00", category: "Flowers", imageUrl: `${IMG}/hero.webp` },
  { name: "Petal candle", description: "Hand-poured soy wax", price: "26.00", category: "Gifts", imageUrl: `${IMG}/gift-bouquet.webp` },
  { name: "Bud vase", description: "Small, hand-glazed", price: "18.00", category: "Gifts", imageUrl: `${IMG}/stone-vase.webp` },
  {
    name: "Wedding arch garland with seasonal roses, eucalyptus and trailing jasmine",
    description: "Made to measure for ceremonies",
    price: "180.00",
    category: "Events",
    imageUrl: null,
  },
  { name: "Sunflower single stem", description: "Bright, cheerful, one stem", price: "4.50", category: "Flowers", imageUrl: null },
];

export const everydayStorePage: PageData = {
  root: {
    props: {
      templateId: "everyday-store",
      businessName: "Petal & Stem",
      statusText: "Open now · until 6:00 PM",
      hours: "9:00 AM – 6:00 PM",
      hoursDetail: "Mon – Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 1:00 PM · Sun closed",
      address: "18 Garden Lane, Phnom Penh",
      phones: [{ number: "012 345 678" }],
      email: "hello@petalandstem.com",
      telegram: "petalandstem",
      facebookUrl: "https://facebook.com/petalandstem",
      instagramUrl: "https://instagram.com/petalandstem",
      currency: "USD",
      palette: "original",
      accentColor: null,
      backgroundColor: null,
      textColor: null,
      font: "original",
      buttonStyle: "rounded",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "everyday-store-hero",
        eyebrow: "",
        heading: "Fresh flowers for\nevery moment.",
        description: "Hand-tied bouquets, single stems and event flowers, arranged in our studio and delivered across town.",
        primaryLabel: "Shop flowers",
        primaryAction: "shop",
        secondaryLabel: "Visit the studio",
        secondaryAction: "visit",
        imageUrl: `${IMG}/hero.webp`,
        sideImages: [],
        highlights: [],
        badge: "",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "everyday-store-product-cards",
        eyebrow: "",
        heading: "Fresh picks, hand-tied today",
        viewAllLabel: "View all products",
        products: popular,
        columns: "4",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "AllProducts",
      props: {
        id: "everyday-store-all-products",
        eyebrow: "",
        heading: "Everything in the studio",
        searchPlaceholder: "Search flowers, bouquets, gifts…",
        categories: [{ name: "Flowers" }, { name: "Bouquets" }, { name: "Gifts" }, { name: "Events" }],
        products: allProducts,
        pageSize: 12,
        columns: "4",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "About",
      props: {
        id: "everyday-store-about",
        eyebrow: "",
        heading: "About the studio",
        body: "We’re a two-person flower studio on Garden Lane. Every bouquet is arranged by hand the morning it goes out, with seasonal stems from local growers.",
        imageUrl: `${IMG}/table-arrangement.webp`,
        caption: "",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "everyday-store-visit-us",
        eyebrow: "Visit us",
        heading: "Come and see the studio",
        align: "center",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "everyday-store-footer",
        tagline: "",
        align: "center",
        spacing: "normal",
      },
    },
  ],
};
