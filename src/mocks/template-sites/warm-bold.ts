import type { WarmBoldContent } from "@/features/template-sites/types/warm-bold";

const img = (name: string) => `/mock/template-sites/warm-bold/${name}.png`;

export const warmBoldContent: WarmBoldContent = {
  brandName: "Kiln Coffee",
  business: {
    name: "Kiln Coffee",
    phone: "012 345 678",
    email: "hello@kilncoffee.com",
    address: "8 Street 308, Phnom Penh",
    hours: [{ days: "Mon – Sun", hours: "6:30 AM – 5:00 PM" }],
  },
  openNowLabel: "Open now · until 5:00 PM",
  hero: {
    imageUrl: img("hero"),
    eyebrow: "EST. 2019 — STREET 308, PHNOM PENH",
    titleLines: ["Roasted this week,", "brewed for you."],
    subtitle:
      "Small-batch beans roasted in our shop on Street 308, and a bar that pours them properly.",
    primaryCta: "See the menu",
    secondaryCta: "Visit the roastery",
    stampLines: ["SMALL", "BATCH", "2× WEEKLY"],
  },
  facts: ["Small batch, roasted here", "Beans from farms we visited", "Bar open 6:30 AM – 5:00 PM daily"],
  popular: {
    eyebrow: "№ 01 — POPULAR THIS WEEK",
    title: "What's pouring this week",
    viewAllLabel: "View all products →",
    featuredLabel: "BEST SELLER",
    featuredProductId: "7a1d0001-0000-4000-8000-000000000001",
    listProductIds: [
      "7a1d0001-0000-4000-8000-000000000002",
      "7a1d0001-0000-4000-8000-000000000003",
    ],
  },
  shop: {
    eyebrow: "№ 02 — ALL PRODUCTS",
    title: "Beans, drinks and more",
    searchPlaceholder: "Search beans, drinks, merch…",
    categories: ["Beans", "Drinks", "Food", "Merch"],
    totalItems: 21,
  },
  about: {
    eyebrow: "№ 03 — ABOUT THE ROASTERY",
    quote:
      "We roast twice a week on a 5 kg drum at the back of the shop. Every bean comes direct from farms we've visited ourselves.",
    author: "Sok Dara, head roaster",
    imageUrl: img("about"),
  },
  visit: {
    eyebrow: "№ 04 — VISIT US",
    title: "Come and see the roastery",
    mapLabel: "Open in Google Maps ↗",
  },
  contact: {
    title: "Send us a message",
    subtitle: "Wholesale beans, events or a quick question.",
    topics: ["Beans", "Wholesale", "Events", "Other"],
    replyNote: "WE USUALLY REPLY WITHIN A DAY",
  },
  footerTagline: "Small-batch roastery & bar on Street 308.",
  social: [
    { label: "Telegram", url: "https://t.me/kilncoffee" },
    { label: "Facebook", url: "https://facebook.com/kilncoffee" },
    { label: "Instagram", url: "https://instagram.com/kilncoffee" },
  ],
  products: [
    { id: "7a1d0001-0000-4000-8000-000000000001", name: "House espresso 250 g", price: "9.00", currency: "USD", category: "Beans", note: "Chocolate, hazelnut", imageUrl: img("house-espresso") },
    { id: "7a1d0001-0000-4000-8000-000000000002", name: "Cold brew bottle", price: "4.00", currency: "USD", category: "Drinks", note: "330 ml, slow-steeped", imageUrl: img("cold-brew") },
    { id: "7a1d0001-0000-4000-8000-000000000003", name: "Flat white", price: "2.75", currency: "USD", category: "Drinks", note: "Double shot, oat or dairy", imageUrl: img("flat-white") },
    { id: "7a1d0001-0000-4000-8000-000000000004", name: "Cinnamon bun", price: "2.50", currency: "USD", category: "Food", note: "Baked at 7 am", imageUrl: img("cinnamon-bun") },
    { id: "7a1d0001-0000-4000-8000-000000000005", name: "Ceramic cup", price: "12.00", currency: "USD", category: "Merch", note: "Rust glaze, 250 ml", imageUrl: img("ceramic-cup") },
    { id: "7a1d0001-0000-4000-8000-000000000006", name: "Ethiopia Guji 250 g", price: "12.00", currency: "USD", category: "Beans", note: "Floral, bright", imageUrl: img("house-espresso") },
    { id: "7a1d0001-0000-4000-8000-000000000007", name: "Iced latte", price: "3.00", currency: "USD", category: "Drinks", note: "With house syrup", imageUrl: img("cold-brew") },
    { id: "7a1d0001-0000-4000-8000-000000000008", name: "Cappuccino", price: "2.75", currency: "USD", category: "Drinks", note: "Classic, dry foam", imageUrl: img("flat-white") },
  ],
};
