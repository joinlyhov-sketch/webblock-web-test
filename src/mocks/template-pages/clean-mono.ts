import type { PageData, Product } from "@/features/editor/types";

// "Clean mono" template demo page (Northpoint Audio). Text is verbatim from Figma.
const IMG = "/mock/templates/clean-mono";

const products: Product[] = [
  { name: "Over-ear wireless", description: "40 h battery, ANC", price: "89.00", category: "Headphones", imageUrl: `${IMG}/over-ear-wireless.webp` },
  { name: "True wireless earbuds", description: "Case gives 24 h", price: "39.00", category: "Earbuds", imageUrl: `${IMG}/true-wireless-earbuds.webp` },
  { name: "Pocket speaker", description: "IPX7, 12 h play", price: "59.00", category: "Speakers", imageUrl: `${IMG}/pocket-speaker.webp` },
  { name: "Studio monitor headphones", description: "Wired, flat response", price: "129.00", category: "Headphones", imageUrl: `${IMG}/over-ear-wireless.webp` },
  { name: "USB-C cable 1 m", description: "Braided, 100 W", price: "9.00", category: "Accessories", imageUrl: `${IMG}/usb-c-cable.webp` },
  { name: "Over-ear wireless · white", description: "40 h battery, ANC", price: "89.00", category: "Headphones", imageUrl: `${IMG}/hero-headphones-white.webp` },
  { name: "Sport earbuds", description: "Ear hooks, sweat-proof", price: "45.00", category: "Earbuds", imageUrl: `${IMG}/true-wireless-earbuds.webp` },
  { name: "Home speaker", description: "Stereo-pair ready", price: "119.00", category: "Speakers", imageUrl: `${IMG}/pocket-speaker.webp` },
  {
    name: "Noise-cancelling travel headphones with foldable hinge and hard case",
    description: "30 h battery, airplane adapter",
    price: "149.00",
    category: "Headphones",
    imageUrl: `${IMG}/hero-headphones-white.webp`,
  },
  { name: "Walnut headphone stand", description: "Solid wood, fits any size", price: "25.00", category: "Accessories", imageUrl: null },
  { name: "Kids volume-limited headphones", description: "85 dB cap, bendable band", price: "29.00", category: "Headphones", imageUrl: `${IMG}/over-ear-wireless.webp` },
  { name: "Bookshelf speakers (pair)", description: "Bluetooth + optical in", price: "199.00", category: "Speakers", imageUrl: `${IMG}/pocket-speaker.webp` },
];

export const cleanMonoPage: PageData = {
  root: {
    props: {
      templateId: "clean-mono",
      businessName: "Northpoint Audio",
      statusText: "Open now · until 8:00 PM",
      hours: "10:00 AM – 8:00 PM",
      hoursDetail: "Mon – Sun · 10:00 AM – 8:00 PM",
      address: "Floor 2, Sorya Center, Phnom Penh",
      phones: [{ number: "012 345 678" }],
      email: "hello@northpointaudio.com",
      telegram: "northpointaudio",
      facebookUrl: "https://facebook.com/northpointaudio",
      instagramUrl: "https://instagram.com/northpointaudio",
      currency: "USD",
      palette: "original",
      accentColor: null,
      backgroundColor: null,
      textColor: null,
      font: "original",
      buttonStyle: "square",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "clean-mono-hero",
        eyebrow: "NP-01 — OVER-EAR WIRELESS",
        heading: "Sound you can feel.",
        description:
          "Headphones, earbuds and speakers you can try before you decide. Second floor, Sorya Center — bring your own music.",
        primaryLabel: "See the gear",
        primaryAction: "shop",
        secondaryLabel: "Visit the store",
        secondaryAction: "visit",
        imageUrl: `${IMG}/hero-headphones-white.webp`,
        sideImages: [],
        highlights: [{ text: "ANC" }, { text: "40 H BATTERY" }, { text: "BT 5.3" }],
        badge: "$89.00",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "clean-mono-product-cards",
        columns: "3",
        eyebrow: "02 — POPULAR THIS WEEK",
        heading: "Most listened this week",
        viewAllLabel: "View all products",
        products: products.slice(0, 3),
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "AllProducts",
      props: {
        id: "clean-mono-all-products",
        columns: "4",
        eyebrow: "03 — ALL PRODUCTS",
        heading: "Everything in the store",
        searchPlaceholder: "Search headphones, speakers…",
        categories: [{ name: "Headphones" }, { name: "Earbuds" }, { name: "Speakers" }, { name: "Accessories" }],
        products,
        pageSize: 8,
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "About",
      props: {
        id: "clean-mono-about",
        eyebrow: "04 — ABOUT THE STORE",
        heading: "A small audio shop with a listening bar. Take your time — nobody will hover.",
        body: "",
        imageUrl: `${IMG}/listening-bar.webp`,
        caption: "THE LISTENING BAR — FLOOR 2, SORYA CENTER",
        stats: [
          { value: "120+", label: "products you can try before buying" },
          { value: "1", label: "listening bar, zero pressure" },
          { value: "7", label: "days a week, 10:00 AM – 8:00 PM" },
        ],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "clean-mono-visit-us",
        eyebrow: "05 — VISIT US",
        heading: "Come and listen",
        align: "center",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "clean-mono-footer",
        tagline: "Sorya Center, floor 2 · Phnom Penh",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
