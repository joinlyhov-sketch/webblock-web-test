import type { PageData, Product } from "@/features/editor/types";

// Plates demo page: Plates, a small plate-lunch restaurant in Phnom Penh. Showcase content only: call, message and
// directions, no ordering.
const IMG = "/mock/templates/plates";

const products: Product[] = [
  {
    name: "Grilled Steak Plate",
    description: "Grilled steak with golden fries, fresh salad and roasted vegetables.",
    price: "8.50",
    category: "Beef",
    imageUrl: `${IMG}/grilled-steak-plate.png`,
  },
  {
    name: "Braised Beef & Rice",
    description: "Tender glazed beef pieces with steamed rice and spring onion.",
    price: "7.50",
    category: "Beef",
    imageUrl: `${IMG}/braised-beef-rice.png`,
  },
  {
    name: "Stir-Fried Beef Plate",
    description: "Sizzled beef with fresh tomato and herbs, served with rice and fries.",
    price: "7.90",
    category: "Beef",
    imageUrl: `${IMG}/stir-fried-beef-plate.png`,
  },
  {
    name: "Grilled Chicken Plate",
    description: "Sliced grilled chicken with rice, carrots, broccoli and tomato.",
    price: "7.50",
    category: "Chicken",
    imageUrl: `${IMG}/grilled-chicken-plate.png`,
  },
];

export const platesPage: PageData = {
  root: {
    props: {
      templateId: "plates",
      businessName: "Plates",
      statusText: "Open today · 9:00 AM – 6:00 PM",
      hours: "9:00 AM – 6:00 PM",
      hoursDetail: "Mon – Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun closed",
      address: "14 Street 51, Daun Penh, Phnom Penh",
      phones: [{ number: "012 345 987" }],
      email: "hello@plates.com",
      telegram: "platesrestaurant",
      facebookUrl: "https://facebook.com/platesrestaurant",
      instagramUrl: "https://instagram.com/platesrestaurant",
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
        id: "plates-hero",
        eyebrow: "Open today · 9:00 AM – 6:00 PM",
        heading: "Plates for *everyday* life.",
        description: "Steak, stir-fried beef, grilled chicken and rice plates. Browse the menu, then come eat with us.",
        primaryLabel: "View menu",
        primaryAction: "shop",
        secondaryLabel: "Visit us",
        secondaryAction: "visit",
        imageUrl: `${IMG}/grilled-steak-plate.png`,
        sideImages: [
          { imageUrl: `${IMG}/braised-beef-rice.png`, label: "Braised Beef & Rice" },
          { imageUrl: `${IMG}/grilled-steak-plate.png`, label: "Grilled Steak" },
          { imageUrl: `${IMG}/stir-fried-beef-plate.png`, label: "Stir-Fried Beef" },
          { imageUrl: `${IMG}/grilled-chicken-plate.png`, label: "Grilled Chicken" },
        ],
        highlights: [{ text: "Fresh daily" }],
        badge: "New arrivals",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "plates-product-cards",
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
        id: "plates-about",
        eyebrow: "About us",
        heading: "Built around good plates.",
        body: "We pick plates for their flavor, balance and detail. Look through the menu here, then visit us in store to taste them.",
        imageUrl: `${IMG}/about-grilled-chicken.png`,
        caption: "Endy · Founder",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "plates-visit-us",
        eyebrow: "Visit us",
        heading: "Come and see the store.",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Text",
      props: {
        id: "plates-taste-in-store",
        eyebrow: "",
        heading: "Come taste them in store.",
        body: "",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "plates-footer",
        tagline: "Plates for everyday life, picked with care. Founded by Endy.",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
