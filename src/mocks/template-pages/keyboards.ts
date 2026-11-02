import type { PageData, Product } from "@/features/editor/types";

// Midnight glow demo page: Keycap Lab, a small keyboard shop in Phnom Penh. Showcase content only: call, message and
// directions, no ordering. Product tags follow a "|" in the description.
const IMG = "/mock/templates/keyboards";

const products: Product[] = [
  {
    name: "Redragon White RGB TKL",
    description:
      "A compact tenkeyless board in white, with per-key RGB backlighting that sweeps from pink through blue to green. | Tenkeyless | RGB backlight | White keycaps | Wired",
    price: "59.00",
    category: "Tenkeyless · RGB",
    imageUrl: `${IMG}/redragon-white-rgb-tkl.png`,
  },
  {
    name: "Sky Blue 75%",
    description:
      "Two-tone grey and periwinkle keycaps on a pale blue case, with a rotary knob and a compact 75% layout. | 75% layout | Rotary knob | Two-tone keycaps | Pale blue case",
    price: "89.00",
    category: "75% · Knob",
    imageUrl: `${IMG}/sky-blue-75.png`,
  },
  {
    name: "Graphite 75%",
    description:
      "A dark 75% board with grey gradient keycaps and a matte black case. | 75% layout | Gradient keycaps | Black case | Wired",
    price: "99.00",
    category: "75% · Dark",
    imageUrl: `${IMG}/graphite-75.png`,
  },
  {
    name: "Sage Green 75%",
    description:
      "A sage and cream 75% board with a rotary knob and soft green accent keys. | 75% layout | Rotary knob | Accent keys | Cream case",
    price: "109.00",
    category: "75% · Knob",
    imageUrl: `${IMG}/sage-green-75.png`,
  },
];

export const keyboardsPage: PageData = {
  root: {
    props: {
      templateId: "keyboards",
      businessName: "Keycap Lab",
      statusText: "Open today · 9:00 AM – 6:00 PM",
      hours: "9:00 AM – 6:00 PM",
      hoursDetail: "Mon – Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun closed",
      address: "52 Street 240, Daun Penh, Phnom Penh",
      phones: [{ number: "012 678 910" }],
      email: "hello@keycaplab.com",
      telegram: "keycaplab",
      facebookUrl: "https://facebook.com/keycaplab",
      instagramUrl: "https://instagram.com/keycaplab",
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
        id: "keyboards-hero",
        eyebrow: "Open today · 9:00 AM – 6:00 PM",
        heading: "Keyboards for everyday life.",
        description:
          "Picked with care." + "\n" + "Compact 75% boards, tenkeyless RGB and two-tone keycap sets. Browse the collection, then come see it in store.",
        primaryLabel: "View products",
        primaryAction: "shop",
        secondaryLabel: "Visit us",
        secondaryAction: "visit",
        imageUrl: `${IMG}/hero-redragon-tkl.png`,
        sideImages: [],
        highlights: [],
        badge: "",
        align: "center",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "keyboards-product-cards",
        columns: "3",
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
        id: "keyboards-about",
        eyebrow: "About us",
        heading: "Built around good keyboards.",
        body: "We pick keyboards for their feel, layout and detail. Look through the collection here, then visit us in store to try them on.",
        imageUrl: `${IMG}/sky-blue-75.png`,
        secondImageUrl: `${IMG}/graphite-75.png`,
        caption: "Endy · Founder",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "keyboards-visit-us",
        eyebrow: "Visit us",
        heading: "Come and see the store.",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Text",
      props: {
        id: "keyboards-try-out",
        eyebrow: "",
        heading: "Come try them out in store.",
        body: "",
        imageUrl: `${IMG}/sage-green-75.png`,
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "keyboards-footer",
        tagline: "Keyboards for everyday life, picked with care. Founded by Endy.",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
