import type { CleanMonoContent } from "@/features/template-sites/types/clean-mono";

const img = (name: string) => `/mock/template-sites/clean-mono/${name}.jpg`;

export const cleanMonoContent: CleanMonoContent = {
  business: {
    name: "Northpoint Audio",
    phone: "012 345 678",
    email: "hello@northpointaudio.com",
    address: "Floor 2, Sorya Center, Phnom Penh",
    hours: [{ days: "Mon – Sun", hours: "10:00 AM – 8:00 PM" }],
  },
  openNowLabel: "Open now · until 8:00 PM",
  todayHours: "10:00 AM – 8:00 PM",
  hero: {
    eyebrow: "NP-01 — OVER-EAR WIRELESS · NEW THIS SEASON",
    titleLines: ["Sound you", "can feel."],
    text: "Headphones, earbuds and speakers you can try before you decide. Second floor, Sorya Center — bring your own music.",
    primaryCta: "See the gear",
    secondaryCta: "Visit the store →",
    specs: ["ANC", "40 H BATTERY", "BT 5.3", "TRY IN STORE"],
    imageUrl: img("hero"),
    imageAlt: "White over-ear wireless headphones",
    counter: "01 / 04",
    price: "89.00",
    currency: "USD",
  },
  popular: {
    eyebrow: "02 — POPULAR THIS WEEK",
    title: "Most listened this week",
    viewAllLabel: "View all products",
    productIds: ["p1", "p2", "p3"],
  },
  catalog: {
    eyebrow: "03 — ALL PRODUCTS",
    title: "Everything in the store",
    totalCount: 32,
    searchPlaceholder: "Search headphones, speakers…",
    categories: ["Headphones", "Earbuds", "Speakers", "Accessories"],
  },
  products: [
    { id: "p1", name: "Over-ear wireless", price: "89.00", currency: "USD", category: "Headphones", note: "40 h battery, ANC", imageUrl: img("over-ear") },
    { id: "p2", name: "True wireless earbuds", price: "39.00", currency: "USD", category: "Earbuds", note: "Case gives 24 h", imageUrl: img("earbuds") },
    { id: "p3", name: "Pocket speaker", price: "59.00", currency: "USD", category: "Speakers", note: "IPX7, 12 h play", imageUrl: img("speaker") },
    { id: "p4", name: "Studio monitor headphones", price: "129.00", currency: "USD", category: "Headphones", note: "Wired, flat response", imageUrl: img("over-ear") },
    { id: "p5", name: "USB-C cable 1 m", price: "9.00", currency: "USD", category: "Accessories", note: "Braided, 100 W", imageUrl: img("cable") },
    { id: "p6", name: "Over-ear wireless · white", price: "89.00", currency: "USD", category: "Headphones", note: "40 h battery, ANC", imageUrl: img("hero") },
    { id: "p7", name: "Sport earbuds", price: "45.00", currency: "USD", category: "Earbuds", note: "Ear hooks, sweat-proof", imageUrl: img("earbuds") },
    { id: "p8", name: "Home speaker", price: "119.00", currency: "USD", category: "Speakers", note: "Stereo-pair ready", imageUrl: img("speaker") },
  ],
  about: {
    eyebrow: "04 — ABOUT THE STORE",
    statement:
      "We're a small audio shop with a listening bar. Bring your own music, try anything on the wall, and take your time — nobody will hover.",
    stats: [
      { value: "120+", label: "products you can try in person" },
      { value: "1", label: "listening bar, zero pressure" },
      { value: "7", label: "days a week, 10:00 AM – 8:00 PM" },
    ],
    imageUrl: img("about"),
    imageAlt: "The listening bar inside the store",
    caption: "THE LISTENING BAR — FLOOR 2, SORYA CENTER",
  },
  visit: {
    eyebrow: "05 — VISIT US",
    title: "Come and listen",
    mapPinTitle: "Northpoint Audio",
    mapPinSubtitle: "Sorya Center, Phnom Penh",
    shortAddress: "Floor 2, Sorya Center, Phnom Penh",
    form: {
      title: "Send us a message",
      intro: "Product questions, trade-ins or a quick hello.",
      topics: ["Headphones", "Speakers", "Trade-in", "Other"],
      replyNote: "We usually reply within a day.",
    },
  },
  social: [
    { label: "Telegram", href: "https://t.me/northpointaudio" },
    { label: "Facebook", href: "https://facebook.com/northpointaudio" },
    { label: "Instagram", href: "https://instagram.com/northpointaudio" },
  ],
  footerNote: "MADE WITH WEBBLOCK",
};
