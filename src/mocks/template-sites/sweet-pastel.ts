import type { SweetPastelContent } from "@/features/template-sites/types/sweet-pastel";

const img = (n: number) => `/mock/template-sites/sweet-pastel/img-${n}.png`;

export const sweetPastelContent: SweetPastelContent = {
  business: {
    name: "Sugar & Crumb",
    phone: "012 345 678",
    email: "hello@sugarandcrumb.com",
    address: "22 Street 240, Phnom Penh",
    hours: [{ days: "Mon – Sun", hours: "7:00 AM – 7:00 PM" }],
  },
  openNote: "Open now · until 7:00 PM",
  hero: {
    kicker: "fresh from the oven, every single day",
    titleLines: ["Baked fresh,", "every morning."],
    subtitle:
      "Cupcakes, cakes and small treats from our kitchen on Street 240. Come in early, the good ones go first.",
    primaryCta: "See the treats",
    secondaryCta: "Visit the bakery",
    stickerOne: "open from 7 am!",
    stickerTwo: "100% real butter",
    images: [img(1), img(2), img(3)],
  },
  popular: {
    kicker: "popular this week",
    title: "This week's favourites",
    viewAll: "View all products",
    productIds: ["sc-1", "sc-2", "sc-3"],
  },
  catalog: {
    kicker: "everything we bake",
    title: "Everything in the bakery",
    searchPlaceholder: "Search cupcakes, cakes, boxes…",
    categories: ["Cupcakes", "Cakes", "Pastries", "Gift boxes"],
    pageSize: 8,
  },
  about: {
    kicker: "our story",
    title: "About the bakery",
    body: "We're a family bakery on Street 240. Everything is mixed, baked and iced in our own kitchen each morning — no mixes, no shortcuts. Come in for a coffee and watch the next batch come out of the oven.",
    imageUrl: img(12),
    stats: [
      { value: "40+", label: "treats daily" },
      { value: "6 am", label: "first batch" },
      { value: "100%", label: "real butter" },
    ],
  },
  visit: {
    kicker: "come say hi",
    title: "Come and see the bakery",
    todayLabel: "Open today",
    todayHours: "7:00 AM – 7:00 PM",
    formTitle: "Send us a message",
    formIntro: "Custom cakes, party treats or a quick question.",
    topics: ["Cupcakes", "Birthdays", "Weddings", "Other"],
    replyNote: "We usually reply within a day.",
  },
  products: [
    { id: "sc-1", name: "Strawberry cupcake", price: "2.50", currency: "USD", category: "Cupcakes", note: "Fresh berry, vanilla sponge", imageUrl: img(4) },
    { id: "sc-2", name: "Chocolate fudge cake", price: "4.00", currency: "USD", category: "Cakes", note: "By the slice or whole", imageUrl: img(5) },
    { id: "sc-3", name: "Lemon tart", price: "3.50", currency: "USD", category: "Pastries", note: "Toasted meringue top", imageUrl: img(6) },
    { id: "sc-4", name: "Birthday box of six", price: "14.00", currency: "USD", category: "Gift boxes", note: "Mix any flavours", imageUrl: img(10) },
    { id: "sc-5", name: "Cinnamon roll", price: "3.00", currency: "USD", category: "Pastries", note: "Baked every morning", imageUrl: img(11) },
    { id: "sc-6", name: "Vanilla bean cupcake", price: "2.50", currency: "USD", category: "Cupcakes", note: "Classic buttercream", imageUrl: img(7) },
    { id: "sc-7", name: "Red velvet slice", price: "4.00", currency: "USD", category: "Cakes", note: "Cream cheese frosting", imageUrl: img(8) },
    { id: "sc-8", name: "Mini tart trio", price: "9.00", currency: "USD", category: "Gift boxes", note: "Lemon, berry, chocolate", imageUrl: img(9) },
  ],
  socials: [
    { label: "Telegram", href: "https://t.me/sugarandcrumb" },
    { label: "Facebook", href: "https://facebook.com/sugarandcrumb" },
    { label: "Instagram", href: "https://instagram.com/sugarandcrumb" },
  ],
  hoursSummary: "Mon – Sun 7:00 AM – 7:00 PM",
};
