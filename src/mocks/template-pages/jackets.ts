import type { PageData, Product } from "@/features/editor/types";

// Street pop demo page: Stitch & Shell, a small jacket shop in Phnom Penh. Everything on it is showcase content:
// call, message and directions only, no ordering.
const IMG = "/mock/templates/jackets";

const products: Product[] = [
  {
    name: "Forest green work jacket",
    description: "Washed cotton twill, corduroy collar and embroidered chest.",
    price: "89.00",
    category: "Jackets",
    imageUrl: `${IMG}/forest-green-work-jacket.png`,
  },
  {
    name: "Stone snap-front jacket",
    description: "Snap-front cropped fit with raglan sleeves and plaid lining.",
    price: "95.00",
    category: "Jackets",
    imageUrl: `${IMG}/stone-snap-front-jacket.png`,
  },
  {
    name: "Camel canvas zip jacket",
    description: "Boxy zip-up in sturdy canvas with four front pockets.",
    price: "79.00",
    category: "Jackets",
    imageUrl: `${IMG}/camel-canvas-zip-jacket.png`,
  },
];

export const jacketsPage: PageData = {
  root: {
    props: {
      templateId: "jackets",
      businessName: "Stitch & Shell",
      statusText: "Open today · 9:00 AM – 6:00 PM",
      hours: "9:00 AM – 6:00 PM",
      hoursDetail: "Mon – Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun closed",
      address: "27 Street 178, Daun Penh, Phnom Penh",
      phones: [{ number: "012 456 789" }],
      email: "hello@stitchandshell.com",
      telegram: "stitchandshell",
      facebookUrl: "https://facebook.com/stitchandshell",
      instagramUrl: "https://instagram.com/stitchandshell",
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
        id: "jackets-hero",
        eyebrow: "Open today · 9:00 AM – 6:00 PM",
        heading: "Jackets" + "\n" + "for" + "\n" + "everyday" + "\n" + "life.",
        description:
          "Picked with care." + "\n" + "Work jackets, snap-fronts and canvas zip-ups. Browse the collection, then come see it in store.",
        primaryLabel: "View products",
        primaryAction: "shop",
        secondaryLabel: "Visit us",
        secondaryAction: "visit",
        imageUrl: `${IMG}/stone-snap-front-jacket.png`,
        sideImages: [{ imageUrl: `${IMG}/forest-green-work-jacket.png` }, { imageUrl: `${IMG}/camel-canvas-zip-jacket.png` }],
        highlights: [{ text: "Corduroy" }, { text: "Everyday outerwear" }, { text: "Work jackets" }],
        badge: "New arrivals · Jackets",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "AllProducts",
      props: {
        id: "jackets-all-products",
        columns: "3",
        eyebrow: "Browse the collection",
        heading: "Our products",
        searchPlaceholder: "Search jackets…",
        categories: [{ name: "Jackets" }],
        products,
        pageSize: 6,
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "About",
      props: {
        id: "jackets-about",
        eyebrow: "About us",
        heading: "Built around good jackets.",
        body: "We pick jackets for their fabric, fit and detail. Look through the collection here, then visit us in store to try them on.",
        imageUrl: `${IMG}/forest-green-work-jacket.png`,
        caption: "Endy · Founder",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "jackets-visit-us",
        eyebrow: "Visit us",
        heading: "Come and see the store",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Text",
      props: {
        id: "jackets-try-on",
        eyebrow: "",
        heading: "Come try them on in store.",
        body: "",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "jackets-footer",
        tagline: "Jackets for everyday life, picked with care. Founded by Endy.",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
