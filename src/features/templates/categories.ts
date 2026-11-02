// Category filter of the template gallery. No data access here, so client components can import it.
import { CATEGORY_LABELS } from "@/config/categories";
import type { TemplateCategory } from "./types";

/** URL value → category. */
export const CATEGORY_BY_PARAM: Record<string, TemplateCategory> = {
  clothes: "CLOTHES",
  "food-beverages": "FOOD_BEVERAGES",
  technology: "TECHNOLOGY",
  handmade: "HANDMADE",
};

/** Options for the "Category" dropdown. `value` is the URL param. */
export const categoryOptions = [
  { value: "", label: "All" },
  ...Object.entries(CATEGORY_BY_PARAM).map(([value, category]) => ({
    value,
    label: CATEGORY_LABELS[category],
  })),
];
