import { z } from "zod";

/** Character limits, shared by the schema and the form inputs (`maxLength`). */
export const PRODUCT_LIMITS = { name: 120, category: 40, description: 300 };
const LIMITS = PRODUCT_LIMITS;

export const productInput = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(LIMITS.name, `Use ${LIMITS.name} characters or fewer.`),
  category: z.string().trim().min(1, "Choose a category.").max(LIMITS.category),
  description: z
    .string()
    .trim()
    .min(10, "Describe the product in at least 10 characters.")
    .max(LIMITS.description, `Use ${LIMITS.description} characters or fewer.`),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price like 12 or 12.50.")
    // Stored as a decimal string with two places, like the API returns it.
    .transform((value) => Number(value).toFixed(2)),
});

export type ProductInput = z.infer<typeof productInput>;

/**
 * Letters in any language (Khmer vowel signs are marks, so \p{M} too), single spaces, and & ' - between
 * words. No digits, emoji or other symbols: categories are shown as tabs on the website.
 */
const CATEGORY_NAME = /^[\p{L}\p{M}]+(?:(?: ?[&'’-] ?| )[\p{L}\p{M}]+)*$/u;

/** "New category" popup and the inline field in the product form. */
export const categoryInput = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a category name.")
    .max(LIMITS.category, `Use ${LIMITS.category} characters or fewer.`)
    .regex(CATEGORY_NAME, "Use letters only. Spaces, & and - between words are fine."),
});

/** First problem with a category name, or `null` when it's fine. The form shows it while typing. */
export function categoryNameError(name: string): string | null {
  const parsed = categoryInput.shape.name.safeParse(name);
  return parsed.success ? null : (parsed.error.issues[0]?.message ?? "Check the category name.");
}
