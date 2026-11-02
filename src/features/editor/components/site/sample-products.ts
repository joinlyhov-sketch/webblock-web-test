import type { Category, Product } from "../../types";

/**
 * Stand-in products for a Product Cards / All products block that has none yet (e.g. just dragged in).
 * Shown in the editor only, so the owner sees each block's real layout; the live site never shows them.
 * Real products are added in the Owner Portal.
 *
 * The two blocks get different samples on purpose: Product Cards is one short row of featured picks,
 * All products is the whole catalogue (categories, search and more than one page).
 */
export const SAMPLE_FEATURED: Product[] = [
  { name: "Best seller", description: "Your most-loved item", price: "18.00", category: "", imageUrl: null },
  { name: "Staff pick", description: "What the team recommends", price: "24.00", category: "", imageUrl: null },
  { name: "New this week", description: "Just arrived", price: "12.00", category: "", imageUrl: null },
  { name: "Seasonal special", description: "Here for a short time", price: "30.00", category: "", imageUrl: null },
];

export const SAMPLE_CATEGORIES: Category[] = [{ name: "Best sellers" }, { name: "New in" }, { name: "Gifts" }];

export const SAMPLE_CATALOGUE: Product[] = [
  { name: "Product one", description: "A short line about it", price: "12.00", category: "Best sellers", imageUrl: null },
  { name: "Product two", description: "What makes it special", price: "18.00", category: "Best sellers", imageUrl: null },
  { name: "Product three", description: "Fresh this season", price: "24.00", category: "New in", imageUrl: null },
  { name: "Product four", description: "Ready to give", price: "30.00", category: "Gifts", imageUrl: null },
  { name: "Product five", description: "Easy to add on", price: "8.00", category: "New in", imageUrl: null },
  { name: "Product six", description: "A few things together", price: "45.00", category: "Gifts", imageUrl: null },
  { name: "Product seven", description: "A customer favourite", price: "15.00", category: "Best sellers", imageUrl: null },
  { name: "Product eight", description: "Small and simple", price: "6.00", category: "New in", imageUrl: null },
  { name: "Product nine", description: "Made to order", price: "52.00", category: "Gifts", imageUrl: null },
];
