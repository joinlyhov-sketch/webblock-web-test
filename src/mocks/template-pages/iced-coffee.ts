import type { PageData, Product } from "@/features/editor/types";

// Café cream demo page: Cold Brew Co, a small iced-drink shop in Phnom Penh. Showcase content only: call, message and
// directions, no ordering.
const IMG = "/mock/templates/iced-coffee";

const products: Product[] = [
  {
    name: "Iced Latte",
    description: "Espresso poured over cold milk and ice.",
    price: "3.50",
    category: "Coffee",
    imageUrl: `${IMG}/iced-latte.png`,
  },
  {
    name: "Iced Mocha",
    description: "Chocolate and espresso swirled through cold milk.",
    price: "3.90",
    category: "Coffee",
    imageUrl: `${IMG}/iced-mocha.png`,
  },
  {
    name: "Matcha Red Bean Latte",
    description: "Matcha layered over milk and sweet red beans.",
    price: "4.20",
    category: "Tea",
    imageUrl: `${IMG}/matcha-red-bean-latte.png`,
  },
  {
    name: "Berry Milk Tea",
    description: "Berry tea layered with milk and soft jelly.",
    price: "3.80",
    category: "Tea",
    imageUrl: `${IMG}/berry-milk-tea.png`,
  },
];

export const icedCoffeePage: PageData = {
  root: {
    props: {
      templateId: "iced-coffee",
      businessName: "Cold Brew Co",
      statusText: "Open today · 9:00 AM – 6:00 PM",
      hours: "9:00 AM – 6:00 PM",
      hoursDetail: "Mon – Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun closed",
      address: "14 Street 51, Daun Penh, Phnom Penh",
      phones: [{ number: "012 345 987" }],
      email: "hello@coldbrewco.com",
      telegram: "coldbrewco",
      facebookUrl: "https://facebook.com/coldbrewco",
      instagramUrl: "https://instagram.com/coldbrewco",
      currency: "USD",
      palette: "original",
      accentColor: null,
      backgroundColor: null,
      textColor: null,
      font: "original",
      buttonStyle: "pill",
    },
  },
  content: [
    {
      type: "Hero",
      props: {
        id: "iced-coffee-hero",
        eyebrow: "Open today · 9:00 AM – 6:00 PM",
        heading: "Iced coffee for *everyday*.",
        description: "Slow-poured lattes and mochas, made fresh over ice. Browse the menu, then come see us in store.",
        primaryLabel: "View products",
        primaryAction: "shop",
        secondaryLabel: "Visit us",
        secondaryAction: "visit",
        imageUrl: `${IMG}/iced-latte.png`,
        sideImages: [
          { imageUrl: `${IMG}/iced-latte.png`, label: "Iced Latte" },
          { imageUrl: `${IMG}/iced-mocha.png`, label: "Iced Mocha" },
          { imageUrl: `${IMG}/matcha-red-bean-latte.png`, label: "Matcha Red Bean" },
          { imageUrl: `${IMG}/berry-milk-tea.png`, label: "Berry Milk Tea" },
        ],
        highlights: [{ text: "Iced lattes" }, { text: "Mochas" }, { text: "New arrivals" }],
        badge: "New arrivals",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "iced-coffee-product-cards",
        columns: "4",
        eyebrow: "Browse the collection",
        heading: "Our products",
        viewAllLabel: "",
        products,
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "About",
      props: {
        id: "iced-coffee-about",
        eyebrow: "About us",
        heading: "Built around good coffee.",
        body: "We pick every drink for its flavour, texture and detail. Look through the menu here, then visit us in store to try one.",
        imageUrl: `${IMG}/about-iced-mocha.png`,
        caption: "Endy · Founder",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "iced-coffee-visit-us",
        eyebrow: "Visit us",
        heading: "Come and see the store.",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Text",
      props: {
        id: "iced-coffee-try-in-store",
        eyebrow: "",
        heading: "Come try them in store.",
        body: "",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "iced-coffee-footer",
        tagline: "Iced coffee for everyday life, picked with care. Founded by Endy.",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
