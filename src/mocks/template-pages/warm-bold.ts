import type { PageData, Product } from "@/features/editor/types";

// "Warm & bold" demo page: Kiln Coffee, a small-batch roastery & bar in Phnom Penh.
const IMG = "/mock/templates/warm-bold";

const products: Product[] = [
  { name: "House espresso 250 g", description: "Chocolate, hazelnut", price: "9.00", category: "Beans", imageUrl: `${IMG}/espresso-bag.webp` },
  { name: "Cold brew bottle", description: "330 ml, slow-steeped", price: "4.00", category: "Drinks", imageUrl: `${IMG}/cold-brew.webp` },
  { name: "Flat white", description: "Double shot, oat or dairy", price: "2.75", category: "Drinks", imageUrl: `${IMG}/flat-white.webp` },
  { name: "Cinnamon bun", description: "Baked at 7 am", price: "2.50", category: "Food", imageUrl: `${IMG}/cinnamon-bun.webp` },
  { name: "Ceramic cup", description: "Rust glaze, 250 ml", price: "12.00", category: "Merch", imageUrl: `${IMG}/ceramic-cup.webp` },
  { name: "Ethiopia Guji 250 g", description: "Floral, bright", price: "12.00", category: "Beans", imageUrl: `${IMG}/espresso-bag.webp` },
  { name: "Iced latte", description: "With house syrup", price: "3.00", category: "Drinks", imageUrl: `${IMG}/cold-brew.webp` },
  { name: "Cappuccino", description: "Classic, dry foam", price: "2.75", category: "Drinks", imageUrl: `${IMG}/flat-white.webp` },
  { name: "Banana bread slice", description: "Brown butter, walnuts", price: "2.25", category: "Food", imageUrl: null },
  {
    name: "Mondulkiri single-origin washed filter roast, limited harvest 250 g",
    description: "Stone fruit, cane sugar",
    price: "11.00",
    category: "Beans",
    imageUrl: `${IMG}/espresso-bag.webp`,
  },
  { name: "Kampot pepper cookie", description: "Dark chocolate, sea salt", price: "1.75", category: "Food", imageUrl: `${IMG}/cinnamon-bun.webp` },
  { name: "Enamel travel mug", description: "Keeps it hot, 350 ml", price: "10.00", category: "Merch", imageUrl: `${IMG}/ceramic-cup.webp` },
];

export const warmBoldPage: PageData = {
  root: {
    props: {
      templateId: "warm-bold",
      businessName: "Kiln Coffee",
      statusText: "Open now · until 5:00 PM",
      hours: "6:30 AM – 5:00 PM",
      hoursDetail: "Mon – Sun · 6:30 AM – 5:00 PM",
      address: "8 Street 308, Phnom Penh",
      phones: [{ number: "012 345 678" }],
      email: "hello@kilncoffee.com",
      telegram: "kilncoffee",
      facebookUrl: "https://facebook.com/kilncoffee",
      instagramUrl: "https://instagram.com/kilncoffee",
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
        id: "warm-bold-hero",
        eyebrow: "EST. 2019 — STREET 308, PHNOM PENH",
        heading: "Roasted fresh,\nbrewed for you.",
        description: "Small-batch beans roasted in our shop on Street 308, and a bar that pours them properly.",
        primaryLabel: "See the menu",
        primaryAction: "shop",
        secondaryLabel: "Visit the roastery",
        secondaryAction: "visit",
        imageUrl: `${IMG}/hero-espresso.webp`,
        sideImages: [],
        highlights: [
          { text: "Small batch, roasted here" },
          { text: "Beans from farms we visited" },
          { text: "Bar open 6:30 AM – 5:00 PM daily" },
        ],
        badge: "SMALL BATCH · 2× WEEKLY",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "ProductCards",
      props: {
        id: "warm-bold-product-cards",
        eyebrow: "№ 01 — POPULAR THIS WEEK",
        heading: "What's pouring this week",
        viewAllLabel: "View all products →",
        products: products.slice(0, 3),
        columns: "3",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "AllProducts",
      props: {
        id: "warm-bold-all-products",
        eyebrow: "№ 02 — ALL PRODUCTS",
        heading: "Beans, drinks and more",
        searchPlaceholder: "Search beans, drinks, merch…",
        categories: [{ name: "Beans" }, { name: "Drinks" }, { name: "Food" }, { name: "Merch" }],
        products,
        pageSize: 8,
        columns: "4",
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "About",
      props: {
        id: "warm-bold-about",
        eyebrow: "№ 03 — ABOUT THE ROASTERY",
        heading: "",
        body: "We roast twice a week on a 5 kg drum at the back of the shop. Every bean comes direct from farms we've visited ourselves.",
        imageUrl: `${IMG}/roaster.webp`,
        caption: "Sok Dara, head roaster",
        stats: [],
        align: "left",
        spacing: "normal",
      },
    },
    {
      type: "VisitUs",
      props: {
        id: "warm-bold-visit-us",
        eyebrow: "№ 04 — VISIT US",
        heading: "Come and see the roastery",
        align: "center",
        spacing: "normal",
      },
    },
    {
      type: "Footer",
      props: {
        id: "warm-bold-footer",
        tagline: "Small-batch roastery & bar on Street 308.",
        align: "left",
        spacing: "normal",
      },
    },
  ],
};
