// Product logic. Pages call the read functions, Server Actions call the write functions.
// Nothing here knows whether data comes from the mock or from Spring.
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/result";
import { ApiError } from "@/lib/api/errors";
import { formFile, imageToDataUrl } from "@/lib/files";
import { checkImage, PRODUCT_IMAGE_RULE } from "@/lib/image-rules";
import { parseTableQuery, type SearchParams } from "@/lib/table-query";
import { formText } from "@/lib/validation/fields";
import { getWebsite } from "@/features/websites/api";
import {
  createProduct,
  createProductCategory,
  deleteProduct,
  listProductCategories,
  listProducts,
  updateProduct,
} from "./api";
import { DEFAULT_PRODUCT_PAGE_SIZE } from "./page-sizes";
import { categoryInput, productInput } from "./schemas";
import type { Product } from "./types";

export type ProductsLayout = "grid" | "list";

const ALL_PRODUCTS = 1000;

/** Everything the Products screen needs. It filters, sorts and pages `products` in the browser. */
export type ProductsData = {
  websiteId: string;
  /** Public host shown in the page description, or `null` before the first deploy. */
  domain: string | null;
  products: Product[];
  /** Every category of the website, in order, for the tabs and the form. */
  categories: string[];
};

/** Starting view read from the URL, so a shared or refreshed link opens on the same search, tab and page. */
export type ProductsFilter = {
  q: string;
  category: string | null;
  layout: ProductsLayout;
  size: number;
  /** Zero-based. */
  page: number;
  sort?: { field: string; direction: "asc" | "desc" };
};

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseInitialProductsFilter(searchParams: SearchParams): ProductsFilter {
  const query = parseTableQuery(searchParams, { size: DEFAULT_PRODUCT_PAGE_SIZE });
  return {
    q: first(searchParams.q).trim(),
    category: first(searchParams.category) || null,
    layout: first(searchParams.view) === "list" ? "list" : "grid",
    // Any typed size from 1 to MAX_PAGE_SIZE is kept (parseTableQuery checks the range).
    size: query.size,
    page: query.page,
    sort: query.sort,
  };
}

/** One request for the whole catalogue of a website (the mock has a few dozen products at most). */
export async function getProductsData(websiteId: string): Promise<ProductsData> {
  const [website, categories, all] = await Promise.all([
    getWebsite(websiteId),
    listProductCategories(websiteId),
    listProducts(websiteId, { page: 0, size: ALL_PRODUCTS }),
  ]);
  return { websiteId, domain: website.domain, products: all.items, categories };
}

/** Creates a product, or updates `productId` when it is set. */
export async function saveProduct(
  websiteId: string,
  productId: string | null,
  formData: FormData,
): Promise<ActionResult<Product>> {
  const values = {
    name: formText(formData, "name"),
    category: formText(formData, "category"),
    description: formText(formData, "description"),
    price: formText(formData, "price"),
  };
  const parsed = productInput.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const image = formFile(formData, "image");
  let imageUrl: string | undefined;
  if (image) {
    const problem = checkImage(image, PRODUCT_IMAGE_RULE);
    if (problem) return { ok: false, message: problem, fieldErrors: { image: [problem] }, values };
    imageUrl = await imageToDataUrl(image);
  } else if (!productId) {
    return {
      ok: false,
      message: "Add a photo so customers can see the product.",
      fieldErrors: { image: ["Add a photo of the product."] },
      values,
    };
  }

  try {
    const product = productId
      ? await updateProduct(websiteId, productId, { ...parsed.data, imageUrl })
      : await createProduct(websiteId, { ...parsed.data, imageUrl });
    return {
      ok: true,
      data: product,
      message: productId ? `${product.name} was updated` : `${product.name} was added to your products`,
    };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message, values };
    throw e;
  }
}

export async function removeProduct(websiteId: string, productId: string): Promise<ActionResult> {
  try {
    const product = await deleteProduct(websiteId, productId);
    return { ok: true, data: undefined, message: `${product.name} was removed` };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    throw e;
  }
}

/** Adds a product category. Returns its name so the tabs and the form can show it at once. */
export async function addCategory(websiteId: string, formData: FormData): Promise<ActionResult<string>> {
  const values = { name: formText(formData, "name") };
  const parsed = categoryInput.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }
  try {
    const name = await createProductCategory(websiteId, parsed.data.name);
    return { ok: true, data: name, message: `${name} was added to your categories` };
  } catch (e) {
    // A duplicate name belongs under the field, like any other validation message.
    if (e instanceof ApiError) return { ok: false, message: e.message, fieldErrors: { name: [e.message] }, values };
    throw e;
  }
}
